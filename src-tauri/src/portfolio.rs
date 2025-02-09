use std::{fs, path::PathBuf, sync::LazyLock};

use dirs::data_local_dir;

use crate::IDENTIFIER;

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
pub fn create_portfolio(name: String, password: 