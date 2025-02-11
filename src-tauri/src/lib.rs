use std::sync::Mutex;

use rusqlite::Connection;

mod portfolio;

const IDENTIFIER: &str = "com.ericfinance.app";

struct AppState {
    connection: Option<Connection>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(AppState { connection: None }))
        .invoke_handler(tauri::generate_handler![
            portfolio::create_portfolio,
            portfolio::select_portfolio,
            portfolio::list_portfolios,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
