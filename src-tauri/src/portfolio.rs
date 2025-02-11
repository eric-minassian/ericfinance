use std::{
    fs,
    path::PathBuf,
    sync::{LazyLock, Mutex},
};

use dirs::data_local_dir;
use rusqlite::Connection;
use tauri::State;

use crate::{AppState, IDENTIFIER};

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
    let mut path = PORTFOLIO_DIR.clone();
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
    state.connection = Some(connection);

    Ok(())
}

#[tauri::command]
pub fn select_portfolio(
    state: State<'_, Mutex<AppState>>,
    name: String,
    password: String,
) -> Result<(), String> {
    let mut path = PORTFOLIO_DIR.clone();
    path.push(format!("{}.sqlite", name));

    if !path.exists() {
        return Err("Portfolio does not exist".to_string());
    }

    let connection =
        Connection::open(&path).map_err(|e| format!("Failed to open database: {}", e))?;

    connection
        .execute_batch(&format!("PRAGMA key = '{}';", password))
        .map_err(|e| format!("Failed to unlock database: {}", e))?;

    let mut state: std::sync::MutexGuard<'_, AppState> =
        state.lock().map_err(|_| "Failed to lock app state")?;
    state.connection = Some(connection);

    Ok(())
}

#[tauri::command]
pub fn list_portfolios() -> Result<Vec<String>, String> {
    if let Ok(entries) = fs::read_dir(&*PORTFOLIO_DIR) {
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
