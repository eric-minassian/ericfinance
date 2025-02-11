use std::{fs, path::PathBuf, sync::LazyLock};

use dirs::data_local_dir;
use rusqlite::Connection;

use crate::IDENTIFIER;

const SETUP_SQL: &str = include_str!("../setup.sql");

static PORTFOLIO_DIR: LazyLock<PathBuf> = LazyLock::new(|| {
    let mut path = data_local_dir().expect("Failed to get data local dir");
    path.push(IDENTIFIER);
    fs::create_dir_all(&path).expect("Failed to create portfolio directory");
    path
});

#[tauri::command]
pub fn list_portfolios() -> Vec<String> {
    if let Ok(entries) = fs::read_dir(&*PORTFOLIO_DIR) {
        return entries
            .filter_map(|entry| entry.ok()) // Ensure valid entries
            .map(|entry| entry.path()) // Convert DirEntry to PathBuf
            .filter(|path| path.extension().map_or(false, |ext| ext == "sqlite")) // Filter for .sqlite files
            .filter_map(|path| {
                path.file_stem()
                    .map(|stem| stem.to_string_lossy().to_string())
            }) // Get the file stem
            .collect();
    }

    vec![]
}

#[tauri::command]
pub fn create_portfolio(name: String, password: String) -> Result<(), ()> {
    let mut path = PORTFOLIO_DIR.clone();
    path.push(format!("{}.sqlite", name));

    let connection = Connection::open(&path).expect("Failed to create portfolio database");

    connection
        .execute_batch(&format!("PRAGMA key = '{}';", password))
        .expect("Failed to set password");

    connection
        .execute_batch(SETUP_SQL)
        .expect("Failed to execute setup.sql");

    Ok(())
}
