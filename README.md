# Running the project locally

### System requirements
- PHP version 8.2 or higher.
- Node version 20 or higher.
- Composer latest version.
- Xammp latest version.

### Step 1
- Clone the project from https://github.com/Monower/inventory-pro2.git to htdocs folder.
Run the below command inside htdocs inside terminal.
```
git clone https://github.com/Monower/inventory-pro2.git
```
- Open the folder in vscode and run the below commands:
```
cp .env.example .env
```

```
composer install
```

```
npm i
```

```
php artisan key:generate
```

Setup database name in env file and then run the below command.

```
php artisan migrate
```

```
php artisan serve
```

In another terminal run the following command
```
npm run dev
```
