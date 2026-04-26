@echo off
echo 🔧 Cleaning up unnecessary files...
echo.

echo Removing debug and test files...
del /f /q check_db_structure.php 2>nul
del /f /q check_env_path.py 2>nul
del /f /q check_patients.php 2>nul
del /f /q check_table.php 2>nul
del /f /q debug-api.html 2>nul
del /f /q debug_chatbot.php 2>nul
del /f /q debug_frontend.php 2>nul
del /f /q debug_loading.php 2>nul
del /f /q debug_patient_portal.html 2>nul
del /f /q debug_pharmacy.php 2>nul
del /f /q diagnose_openrouter.php 2>nul
del /f /q fixed_auth_helper.php 2>nul
del /f /q quick_test.php 2>nul
del /f /q test-auth.html 2>nul
del /f /q test_api.php 2>nul
del /f /q test_api_response.php 2>nul
del /f /q test_db_structure.php 2>nul
del /f /q test_direct_api.php 2>nul
del /f /q test_doctors_api.php 2>nul
del /f /q test_medicines_api.php 2>nul
del /f /q test_medicines_page.html 2>nul
del /f /q test_openrouter_api.py 2>nul
del /f /q test_pharmacy_api.php 2>nul
del /f /q test_simple.php 2>nul

echo.
echo ✅ Cleanup completed!
echo.
echo Files that should remain:
echo - backend/ (API endpoints)
echo - src/ (React components)
echo - public/ (assets)
echo - package.json, vite.config.ts (build files)
echo - README.md, .gitignore (project files)
echo.
echo Press any key to exit...
pause >nul
