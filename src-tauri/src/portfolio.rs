use std::{
    fs,
    path::PathBuf,
    sync::{LazyLock, Mutex},
};

use dirs::data_local_dir;
use rusqlite::Connection;
use tauri::State;

use crate::{AppState, PortfolioAppState, IDENTIFIER};

const SETUP_SQL: &str = include_str!("../setup.sql");

static PORTFOLIO_DIR: LazyLock<PathBuf> = LazyLock::new(|| {
    let mut path = data_local_dir().expect("Failed to get data local dir");
    path.push(IDENTIFIER);
    fs::create_dir_all(&path).expect("Failed to create portfolio directory");
    path
});

#[tauri::command]
pub fn create_portfolio(
    state: State<'_, Mutex<AppState>>,
    name: String,
    password: String,
) -> Result<(), String> {
    create_portfolio_inner(&PORTFOLIO_DIR.clone(), state.inner(), name, password)
}

fn create_portfolio_inner(
    path: &PathBuf,
    state: &Mutex<AppState>,
    name: String,
    password: String,
) -> Result<(), String> {
    let mut path = path.clone();
    path.push(format!("{}.sqlite", name));

    if path.exists() {
        return Err("Portfolio already exists".to_string());
    }

    let connection =
        Connection::open(&path).map_err(|e| format!("Failed to create database: {}", e))?;

    connection
        .execute_batch(&format!("PRAGMA key = '{}';", password))
        .map_err(|e| format!("Failed to set password: {}", e))?;

    connection
        .execute_batch(SETUP_SQL)
        .map_err(|e| format!("Failed to execute setup SQL: {}", e))?;

    let mut state = state.lock().map_err(|_| "Failed to lock app state")?;
    state.portfolio = Some(PortfolioAppState { name, connection });

    Ok(())
}

#[tauri::command]
pub fn select_portfolio(
    state: State<'_, Mutex<AppState>>,
    name: String,
    password: String,
) -> Result<(), String> {
    select_portfolio_inner(&PORTFOLIO_DIR.clone(), state.inner(), name, password)
}

fn select_portfolio_inner(
    path: &PathBuf,
    state: &Mutex<AppState>,
    name: String,
    password: String,
) -> Result<(), String> {
    let mut path = path.clone();
    path.push(format!("{}.sqlite", name));

    if !path.exists() {
        return Err("Portfolio does not exist".to_string());
    }

    let connection =
        Connection::open(&path).map_err(|e| format!("Failed to open database: {}", e))?;

    connection
        .execute_batch(&format!("PRAGMA key = '{}';", password))
        .map_err(|e| format!("Failed to unlock database: {}", e))?;

    connection
        .query_row("SELECT count(*) FROM sqlite_master", [], |row| {
            row.get::<_, i64>(0)
        })
        .map_err(|e| format!("Failed to unlock database: {}", e))?;

    let mut state = state.lock().map_err(|_| "Failed to lock app state")?;
    state.portfolio = Some(PortfolioAppState { name, connection });

    Ok(())
}

#[tauri::command]
pub fn delete_portfolio(state: State<'_, Mutex<AppState>>, name: String) -> Result<(), String> {
    delete_portfolio_inner(&PORTFOLIO_DIR, state.inner(), name)
}

fn delete_portfolio_inner(
    path: &PathBuf,
    state: &Mutex<AppState>,
    name: String,
) -> Result<(), String> {
    let mut path = path.clone();
    path.push(format!("{}.sqlite", name));

    let mut state = state.lock().map_err(|_| "Failed to lock app state")?;
    if let Some(portfolio) = &state.portfolio {
        if portfolio.name == name {
            state.portfolio = None;
        }
    }

    fs::remove_file(&path).map_err(|e| format!("Failed to delete portfolio: {}", e))
}

#[tauri::command]
pub fn list_portfolios() -> Result<Vec<String>, String> {
    list_portfolios_inner(&PORTFOLIO_DIR)
}

fn list_portfolios_inner(path: &PathBuf) -> Result<Vec<String>, String> {
    if let Ok(entries) = fs::read_dir(path) {
        return Ok(entries
            .filter_map(|entry| entry.ok())
            .map(|entry| entry.path())
            .filter(|path| path.extension().map_or(false, |ext| ext == "sqlite"))
            .filter_map(|path| {
                path.file_stem()
                    .map(|stem| stem.to_string_lossy().to_string())
            })
            .collect());
    }

    Err("Failed to list portfolios".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Mutex;
    use tempfile::TempDir;

    struct TestContext {
        temp_dir: TempDir,
        state: Mutex<AppState>,
    }

    impl TestContext {
        fn new() -> Self {
            let temp_dir = TempDir::new().unwrap();
            let state = Mutex::new(AppState { portfolio: None });
            Self { temp_dir, state }
        }

        fn path(&self) -> PathBuf {
            self.temp_dir.path().to_path_buf()
        }
    }

    #[test]
    fn test_create_portfolio_success() {
        let ctx = TestContext::new();

        let result = create_portfolio_inner(
            &ctx.path(),
            &ctx.state,
            "test_portfolio".to_string(),
            "password123".to_string(),
        );
        assert!(result.is_ok());

        // Verify portfolio file was created
        let path = ctx.path().join("test_portfolio.sqlite");
        assert!(path.exists());
    }

    #[test]
    fn test_create_portfolio_duplicate() {
        let ctx = TestContext::new();

        // Create first portfolio
        let _ = create_portfolio_inner(
            &ctx.path(),
            &ctx.state,
            "duplicate_test".to_string(),
            "password123".to_string(),
        );

        // Try to create duplicate
        let result = create_portfolio_inner(
            &ctx.path(),
            &ctx.state,
            "duplicate_test".to_string(),
            "password123".to_string(),
        );
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Portfolio already exists");
    }

    #[test]
    fn test_select_portfolio_success() {
        let ctx = TestContext::new();

        // First create a portfolio
        let _ = create_portfolio_inner(
            &ctx.path(),
            &ctx.state,
            "select_test".to_string(),
            "password123".to_string(),
        );

        // Then try to select it
        let result = select_portfolio_inner(
            &ctx.path(),
            &ctx.state,
            "select_test".to_string(),
            "password123".to_string(),
        );
        assert!(result.is_ok());

        // Verify connection is set in state
        let state_guard = ctx.state.lock().unwrap();
        assert!(state_guard.portfolio.is_some());
    }

    #[test]
    fn test_select_portfolio_nonexistent() {
        let ctx = TestContext::new();

        let result = select_portfolio_inner(
            &ctx.path(),
            &ctx.state,
            "nonexistent".to_string(),
            "password123".to_string(),
        );
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Portfolio does not exist");
    }

    #[test]
    fn test_select_portfolio_wrong_password() {
        let ctx = TestContext::new();

        // Create portfolio with one password
        let _ = create_portfolio_inner(
            &ctx.path(),
            &ctx.state,
            "password_test".to_string(),
            "correct_password".to_string(),
        );

        // Try to select with wrong password
        let result = select_portfolio_inner(
            &ctx.path(),
            &ctx.state,
            "password_test".to_string(),
            "wrong_password".to_string(),
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Failed to unlock database"));
    }

    #[test]
    fn test_delete_portfolio() {
        let ctx = TestContext::new();

        // Create a portfolio
        let _ = create_portfolio_inner(
            &ctx.path(),
            &ctx.state,
            "delete_test".to_string(),
            "password123".to_string(),
        );

        // Delete the portfolio
        let result = delete_portfolio_inner(&ctx.path(), &ctx.state, "delete_test".to_string());
        assert!(result.is_ok());

        // Verify portfolio file was deleted
        let path = ctx.path().join("delete_test.sqlite");
        assert!(!path.exists());

        // Verify state was cleared
        let state_guard = ctx.state.lock().unwrap();
        assert!(state_guard.portfolio.is_none());
    }

    #[test]
    fn test_list_portfolios() {
        let ctx = TestContext::new();

        // Create a few portfolios
        let portfolios = vec!["portfolio1", "portfolio2", "portfolio3"];
        for portfolio in &portfolios {
            let _ = create_portfolio_inner(
                &ctx.path(),
                &ctx.state,
                portfolio.to_string(),
                "password123".to_string(),
            );
        }

        // List portfolios and verify
        let result = list_portfolios_inner(&ctx.path());
        assert!(result.is_ok());
        let mut listed_portfolios = result.unwrap();
        listed_portfolios.sort(); // Sort for reliable comparison

        let mut expected_portfolios: Vec<String> =
            portfolios.iter().map(|s| s.to_string()).collect();
        expected_portfolios.sort();

        assert_eq!(listed_portfolios, expected_portfolios);
    }
}
