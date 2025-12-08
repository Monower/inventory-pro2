# Run the below commands:
* ``composer install --no-dev --optimize-autoloader``
* ``php artisan config:cache``
* ``php artisan route:cache``
* ``php artisan view:cache``
* ``npm i``
* ``npm run build``

## Steps
1. Zip the entire project without the node-modules.
2. Place that zip in /home/user-name/ and extract it in ```your-app-directory-name```.
3. Extract the zip.
4. After running ```npm run build``` modify the ```public/index.php``` file like below:
    ```
   <?php

        use Illuminate\Foundation\Application;
        use Illuminate\Http\Request;

        define('LARAVEL_START', microtime(true));

        // Determine if the application is in maintenance mode...
        if (file_exists($maintenance = __DIR__.'/../your-app-directory-name/storage/framework/maintenance.php')) {
            require $maintenance;
        }

        // Register the Composer autoloader...
        require __DIR__.'/../your-app-directory-name/vendor/autoload.php';

        // Bootstrap Laravel and handle the request...
        /** @var Application $app */
        $app = require_once __DIR__.'/../your-app-directory-name/bootstrap/app.php';

        $app->handleRequest(Request::capture());
    ```
5. Then zip the ```public`` folder.
6. Put that zipped folder in ```public_html`` folder and extract it.
7. In cpanel create new database, new user for database. Add that user to that database.
8. Update the below variables of the .env file:
    APP_DEBUG
    APP_URL
    DB_DATABASE
    DB_USERNAME
    DB_PASSWORD
    SESSION_DRIVER=cookie
    QUEUE_CONNECTION=sync

9. Import database from local.
10. Create a new file insite ```public_html``` symlink.php and put necessary codes in it.
11. Now goto your-domain/symlink.php. Check if symbolic link is created in public_html. If created, delete the symlink.php file.