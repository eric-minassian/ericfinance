mod portfolio;

const IDENTIFIER: &str = "com.ericfinance.app";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            portfolio::list_portfolios,
            portfolio::create_portfolio
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
