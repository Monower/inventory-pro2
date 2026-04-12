<?php

return [
    'starter' => [
        'description' => 'For small businesses that need workspace management.',
        'modules' => [
            'Dashboard and business overview',
            'Workspace settings',
            'Billing and plan management',
            'Profile management',
        ],
    ],
    'growth' => [
        'description' => 'For growing teams that need finance controls and broader workspace operations.',
        'modules' => [
            'Everything in Starter',
        ],
    ],
    'scale' => [
        'description' => 'For mature operations that need governance and broader operational control.',
        'modules' => [
            'Everything in Growth',
        ],
    ],
];
