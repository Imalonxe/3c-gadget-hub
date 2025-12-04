<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CustomerProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\AnswerController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\BackupController;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    $announcement = \App\Models\Announcement::active()->latest()->first();
    
    return Inertia::render('Home', [
        'featuredProducts' => Product::with(['category', 'images'])
            ->featured()
            ->active()
            ->take(8)
            ->get(),
        'categories' => Category::active()->ordered()->where('is_featured', 1)->get(),
        'announcement' => $announcement
    ]);
})->name('home');

// Product Routes
Route::group(['prefix' => 'products'], function () {
    Route::get('/', [CustomerProductController::class, 'index'])->name('products.index');
    Route::get('/list', [CustomerProductController::class, 'productList'])->name('products.list');
    Route::get('/{product:slug}', [CustomerProductController::class, 'show'])->name('products.show');
    
    // Product Reviews
    Route::post('/{product:slug}/reviews', [ReviewController::class, 'store'])
        ->middleware(['auth'])
        ->name('products.reviews.store');
});

// Level Benefits (User)
Route::middleware(['auth'])->group(function () {
    Route::get('/my-level-benefits', [App\Http\Controllers\LevelBenefitController::class, 'index'])->name('level-benefits.my-benefits');
});

// Cart Routes
Route::group(['prefix' => 'cart', 'middleware' => ['auth']], function () {
    Route::get('/', [CartController::class, 'index'])->name('cart.index');
    Route::post('/add/{product}', [CartController::class, 'add'])->name('cart.add');
    Route::patch('/update/{product}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/remove/{product}', [CartController::class, 'remove'])->name('cart.remove');
});

// Checkout Routes
Route::group(['prefix' => 'checkout', 'middleware' => ['auth']], function () {
    Route::get('/', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('/success/{order}', [CheckoutController::class, 'success'])->name('checkout.success');
});

// Payment Routes
Route::group(['prefix' => 'payment', 'middleware' => ['auth']], function () {
    Route::get('/{order}', [PaymentController::class, 'show'])->name('payment.show');
    Route::post('/{order}/upload-slip', [PaymentController::class, 'uploadSlip'])->name('payment.uploadSlip');
    // Accept both GET and POST for the success endpoint. Some payment providers redirect with GET.
    Route::match(['get', 'post'], '/{order}/success', [PaymentController::class, 'success'])->name('payment.success');
    Route::post('/{order}/failed', [PaymentController::class, 'failed'])->name('payment.failed');
});

// Stripe Webhook
Route::post('/stripe/webhook', [PaymentController::class, 'webhook'])->name('stripe.webhook');

// User Profile & Orders
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // User Orders
    Route::get('/orders', [OrderController::class, 'userOrders'])->name('user.orders');
    // User export of admin-style invoice (only for owner and when paid)
    Route::get('/orders/{order}/export', [OrderController::class, 'userExportPdf'])->name('user.orders.export');
    Route::get('/orders/{order}', [OrderController::class, 'userOrderDetails'])->name('user.orders.show');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('user.orders.cancel');
    
    // User Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist', [WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('/wishlist/{product}', [WishlistController::class, 'destroy'])->name('wishlist.destroy');
    Route::post('/wishlist/{product}/move-to-cart', [WishlistController::class, 'moveToCart'])->name('wishlist.moveToCart');

    // User addresses CRUD
    Route::get('/addresses', [\App\Http\Controllers\AddressController::class, 'index'])->name('addresses.index');
    Route::post('/addresses', [\App\Http\Controllers\AddressController::class, 'store'])->name('addresses.store');
    Route::put('/addresses/{address}', [\App\Http\Controllers\AddressController::class, 'update'])->name('addresses.update');
    Route::delete('/addresses/{address}', [\App\Http\Controllers\AddressController::class, 'destroy'])->name('addresses.destroy');
    Route::post('/addresses/{address}/default', [\App\Http\Controllers\AddressController::class, 'setDefault'])->name('addresses.set_default');

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/mark-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');

    // User Coupons (apply / validate)
    Route::get('/coupons', function () {
        // Provide current cart subtotal so the coupon validation endpoint can validate against it
        $subtotal = 0;
        $cart = \App\Models\Cart::getOrCreateCartForUser();
        if ($cart) {
            $cartItems = \App\Models\CartItem::where('cart_id', $cart->cart_id)->get();
            $subtotal = $cartItems->sum(function ($item) {
                return $item->quantity * $item->price_at_add;
            });
        }

        return Inertia::render('User/Coupons/Index', [
            'subtotal' => $subtotal,
        ]);
    })->name('coupons.index');
    
    // User Tickets
    Route::get('/my-tickets', [App\Http\Controllers\ContactController::class, 'myTickets'])->name('my-tickets.index');
    Route::get('/my-tickets/{ticket}', [App\Http\Controllers\ContactController::class, 'show'])->name('my-tickets.show');
    Route::post('/my-tickets/{ticket}/reply', [App\Http\Controllers\ContactController::class, 'reply'])->name('my-tickets.reply');

    // Price Alerts
    Route::post('/price-alerts', [App\Http\Controllers\PriceAlertController::class, 'store'])->name('price-alerts.store');
    Route::delete('/price-alerts/{priceAlert}', [App\Http\Controllers\PriceAlertController::class, 'destroy'])->name('price-alerts.destroy');

    // Badges
    Route::get('/my-badges', [App\Http\Controllers\BadgeController::class, 'index'])->name('badges.index');
});

// Community Routes
Route::group(['prefix' => 'community'], function () {
    // Questions
    Route::get('/questions', [QuestionController::class, 'index'])->name('questions.index');
    Route::get('/questions/{question}', [QuestionController::class, 'show'])->name('questions.show');
    Route::post('/questions', [QuestionController::class, 'store'])
        ->name('questions.store')
        ->middleware(['auth', 'verified']);
    Route::put('/questions/{question}', [QuestionController::class, 'update'])->name('questions.update')->middleware('auth');
    Route::delete('/questions/{question}', [QuestionController::class, 'destroy'])->name('questions.destroy')->middleware('auth');
    Route::post('/questions/{question}/vote', [QuestionController::class, 'vote'])->name('questions.vote')->middleware('auth');
    
    // Answers
    Route::post('/questions/{question}/answers', [AnswerController::class, 'store'])->name('answers.store')->middleware('auth');
    Route::put('/answers/{answer}', [AnswerController::class, 'update'])->name('answers.update')->middleware('auth');
    Route::delete('/answers/{answer}', [AnswerController::class, 'destroy'])->name('answers.destroy')->middleware('auth');
    
    Route::middleware(['auth'])->group(function () {
        Route::post('/questions', [QuestionController::class, 'store'])->name('questions.store');
        Route::put('/questions/{question}', [QuestionController::class, 'update'])->name('questions.update');
        Route::delete('/questions/{question}', [QuestionController::class, 'destroy'])->name('questions.destroy');
        Route::post('/questions/{question}/vote', [QuestionController::class, 'vote'])->name('questions.vote');
        
        // Answers
        Route::post('/questions/{question}/answers', [AnswerController::class, 'store'])->name('answers.store');
        Route::put('/answers/{answer}', [AnswerController::class, 'update'])->name('answers.update');
        Route::delete('/answers/{answer}', [AnswerController::class, 'destroy'])->name('answers.destroy');
        Route::post('/answers/{answer}/vote', [AnswerController::class, 'vote'])->name('answers.vote');
        Route::post('/answers/{answer}/accept', [AnswerController::class, 'accept'])->name('answers.accept');
    });
});

// Admin Routes
Route::group([
    'prefix' => 'admin',
    'middleware' => ['auth', 'admin'],
    'as' => 'admin.'
], function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    // One-click report download for analytics
    Route::get('/dashboard/report', [AdminController::class, 'downloadReport'])->name('dashboard.report');
    
    // Categories Management
    Route::resource('categories', CategoryController::class);
    Route::post('categories/order', [CategoryController::class, 'updateOrder'])->name('categories.order');
    Route::post('categories/{category}/toggle-active', [CategoryController::class, 'toggleActive'])->name('categories.toggle-active');
    
    // Products Management
    Route::post('products/bulk-destroy', [ProductController::class, 'bulkDestroy'])->name('products.bulk-destroy');
    Route::resource('products', ProductController::class);
    Route::post('products/{product}/toggle-active', [ProductController::class, 'toggleActive'])->name('products.toggle-active');
    Route::post('products/{product}/toggle-featured', [ProductController::class, 'toggleFeatured'])->name('products.toggle-featured');
    Route::delete('products/{product}/images/{image}', [ProductController::class, 'deleteImage'])->name('products.images.destroy');
    
    // Orders Management
    // Provide admin edit page for orders (resource excludes edit by default)
    // Note: the admin group already prefixes route names with 'admin.' so name this
    // route 'orders.edit' (it will become 'admin.orders.edit').
    Route::get('orders/{order}/edit', [OrderController::class, 'edit'])->name('orders.edit');
    // Export order invoice to PDF
    Route::get('orders/{order}/export', [OrderController::class, 'exportPdf'])->name('orders.export');
    // Export shipping label
    Route::get('orders/{order}/export-label', [OrderController::class, 'exportShippingLabel'])->name('orders.export-label');

    // Database Backups
    Route::get('backups', [BackupController::class, 'index'])->name('backups.index');
    Route::post('backups', [BackupController::class, 'store'])->name('backups.store');
    Route::get('backups/{filename}/download', [BackupController::class, 'download'])->name('backups.download');
    Route::delete('backups/{filename}', [BackupController::class, 'destroy'])->name('backups.destroy');
    Route::resource('orders', OrderController::class)->except(['create', 'store', 'edit', 'destroy']);
    Route::post('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
    Route::post('orders/{order}/shipping', [OrderController::class, 'updateShipping'])->name('orders.shipping');
    Route::post('orders/bulk-update', [OrderController::class, 'bulkUpdateStatus'])->name('orders.bulk-update');
    Route::post('orders/bulk-export-pdf', [OrderController::class, 'bulkExportPdf'])->name('orders.bulk-export-pdf');
    
    // Community Management (Admin)
    // Admin questions management routes
    Route::get('questions/manage', [QuestionController::class, 'adminIndex'])->name('questions.manage');
    // Admin list (used by admin UI)
    Route::get('questions', [QuestionController::class, 'adminIndex'])->name('questions.index');
    // Allow admins to update status and delete questions
    Route::post('questions/{question}/status', [QuestionController::class, 'updateStatus'])->name('questions.status');
    Route::delete('questions/{question}', [QuestionController::class, 'destroy'])->name('questions.destroy');
    // Admin single-question view (admin UI)
    Route::get('questions/{question}/show', [QuestionController::class, 'adminShow'])->name('questions.show');
    Route::post('answers/{answer}/approve', [AnswerController::class, 'approve'])->name('answers.approve');
    
    // Users Management
    Route::resource('users', UserController::class);
    Route::post('users/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle-active');
    Route::post('users/{user}/ban', [UserController::class, 'ban'])->name('users.ban');
    Route::post('users/{user}/unban', [UserController::class, 'unban'])->name('users.unban');
    
    // Coupons Management
    Route::delete('coupons/bulk-destroy', [CouponController::class, 'bulkDestroy'])->name('coupons.bulk-destroy');
    Route::put('coupons/bulk-update', [CouponController::class, 'bulkUpdate'])->name('coupons.bulk-update');
    Route::resource('coupons', CouponController::class);

    // (Settings removed) Admin settings routes were removed.

    // Payment settings (PromptPay)
    Route::get('payment', [\App\Http\Controllers\Admin\PaymentController::class, 'index'])->name('payment.index');
    Route::post('payment', [\App\Http\Controllers\Admin\PaymentController::class, 'update'])->name('payment.update');

    // Shipping Providers Management
    Route::resource('shipping-providers', \App\Http\Controllers\Admin\ShippingProviderController::class);
    Route::post('shipping-providers/{shippingProvider}/toggle-active', [
        \App\Http\Controllers\Admin\ShippingProviderController::class, 'toggleActive'
    ])->name('shipping-providers.toggle-active');
    Route::post('shipping-providers/order', [
        \App\Http\Controllers\Admin\ShippingProviderController::class, 'updateOrder'
    ])->name('shipping-providers.order');

    // Activity Logs (Admin UI)
    Route::get('activity-logs', [\App\Http\Controllers\Admin\ActivityLogController::class, 'index'])->name('activity-logs.index');
    Route::get('activity-logs/{id}', [\App\Http\Controllers\Admin\ActivityLogController::class, 'show'])->name('activity-logs.show');

    // Announcements Management
    Route::resource('announcements', \App\Http\Controllers\Admin\AnnouncementController::class);
    Route::post('announcements/{announcement}/toggle-active', function (\App\Models\Announcement $announcement) {
        $announcement->update(['is_active' => !$announcement->is_active]);
        return back();
    })->name('announcements.toggle-active');

    // Tickets Management
    Route::get('tickets', [\App\Http\Controllers\Admin\TicketController::class, 'index'])->name('tickets.index');
    Route::get('tickets/{ticket}', [\App\Http\Controllers\Admin\TicketController::class, 'show'])->name('tickets.show');
    Route::put('tickets/{ticket}', [\App\Http\Controllers\Admin\TicketController::class, 'update'])->name('tickets.update');
    Route::post('tickets/{ticket}/reply', [\App\Http\Controllers\Admin\TicketController::class, 'reply'])->name('tickets.reply');

    // Missions Management (Synergy Loadout)
    Route::resource('missions', \App\Http\Controllers\Admin\MissionController::class);
    // Analytics
    Route::get('analytics', [\App\Http\Controllers\Admin\AnalyticsController::class, 'index'])->name('analytics');
    Route::post('analytics/experiments', [\App\Http\Controllers\Admin\AnalyticsController::class, 'storeExperiment'])->name('analytics.experiments.store');
    Route::delete('analytics/experiments/{mission}', [\App\Http\Controllers\Admin\AnalyticsController::class, 'destroyExperiment'])->name('analytics.experiments.destroy');

    // Level Benefits
    Route::resource('level-benefits', App\Http\Controllers\Admin\LevelBenefitController::class)->except(['create', 'edit', 'show']);
});

// Coupon Validation Route
Route::post('/validate-coupon', [CouponController::class, 'validateCoupon'])
    ->middleware(['auth', 'throttle:10,1'])
    ->name('coupons.validate');

// Public page showing available coupons
Route::get('/coupons/all', [CouponController::class, 'all'])
    ->middleware('auth')
    ->name('coupons.all');

// Public coupons JSON for client-side listing/claiming
Route::get('/coupons/public-json', [CouponController::class, 'publicJson'])
    ->middleware('auth')
    ->name('coupons.public_json');



require __DIR__.'/auth.php';

// Banned user page
Route::get('/banned', function () {
    $user = auth()->user();
    
    // If user is not banned (or ban has expired), redirect to home
    if (!$user->isBanned()) {
        return redirect()->route('home')->with('success', 'คุณได้รับการปลดแบนแล้ว สามารถใช้งานระบบได้ตามปกติ');
    }
    
    \Log::info('Banned route accessed', [
        'user_id' => $user->id,
        'banned_until' => $user->banned_until,
        'ban_reason' => $user->ban_reason
    ]);
    
    return Inertia::render('Auth/Banned');
})->middleware('auth')->name('banned');

// Endpoint for client-side activity events (e.g. F12, copy/paste notifications)
Route::post('/activity-logs/event', [\App\Http\Controllers\Admin\ActivityLogController::class, 'storeEvent'])
    ->name('activity-logs.event')
    ->middleware('auth');

// Static policy pages
Route::get('/privacy', function () {
    return Inertia::render('Privacy');
})->name('privacy');

Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

// FAQ page
Route::get('/faq', function () {
    return Inertia::render('FAQ');
})->name('faq');

// Shipping page
Route::get('/shipping', function () {
    return Inertia::render('Shipping');
})->name('shipping');

// About page
Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

// Contact Us
Route::get('/contact', [App\Http\Controllers\ContactController::class, 'index'])->name('contact.index');
Route::post('/contact', [App\Http\Controllers\ContactController::class, 'store'])->name('contact.store');

// Synergy Loadout
Route::get('/loadout', [App\Http\Controllers\LoadoutController::class, 'index'])->name('loadout.index');
Route::get('/loadout/{mission}', [App\Http\Controllers\LoadoutController::class, 'show'])->name('loadout.show');
Route::post('/loadout/{mission}/cart', [App\Http\Controllers\LoadoutController::class, 'addToCart'])->name('loadout.cart');





