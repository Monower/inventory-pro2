<?php

return [
    'starter' => [
        'description' => 'For small businesses that need core inventory, sales, customer, and workspace management.',
        'modules' => [
            'Dashboard and business overview',
            'Products',
            'Categories and subcategories',
            'Customers',
            'Orders and sales workflow',
            'Workspace settings',
            'Billing and plan management',
            'Profile management',
        ],
    ],
    'growth' => [
        'description' => 'For growing teams that need purchasing, finance controls, and multi-user operations.',
        'modules' => [
            'Everything in Starter',
            'Printable invoices and receipts',
            'Attributes',
            'Purchases',
            'Transactions',
            'Banks and account tracking',
            'Staff management',
            'Users and team access',
        ],
    ],
    'scale' => [
        'description' => 'For mature operations that need governance, payroll workflows, and broader operational control.',
        'modules' => [
            'Everything in Growth',
            'Roles and permission management',
            'Salaries',
            'Advance salaries',
        ],
    ],
];
