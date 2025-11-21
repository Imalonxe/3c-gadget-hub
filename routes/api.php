<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\AnswerController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Routes
Route::group(['prefix' => 'v1'], function () {
    // Authentication
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    
    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    
    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product:slug}', [ProductController::class, 'show']);
    Route::get('/products/{product}/reviews', [ProductController::class, 'reviews']);
    
    // Questions
    Route::get('/questions', [QuestionController::class, 'index']);
    Route::get('/questions/{question}', [QuestionController::class, 'show']);
    Route::get('/questions/{question}/answers', [QuestionController::class, 'answers']);
});

// Protected Routes
Route::group(['prefix' => 'v1', 'middleware' => ['auth:sanctum']], function () {
    // User Profile
    Route::get('/user', [UserController::class, 'profile']);
    Route::put('/user', [UserController::class, 'update']);
    Route::post('/user/avatar', [UserController::class, 'updateAvatar']);
    
    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add/{product}', [CartController::class, 'add']);
    Route::patch('/cart/update/{product}', [CartController::class, 'update']);
    Route::delete('/cart/remove/{product}', [CartController::class, 'remove']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);
    
    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    
    // Product Reviews
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);
    Route::put('/products/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/products/reviews/{review}', [ReviewController::class, 'destroy']);
    
    // Questions
    Route::post('/questions', [QuestionController::class, 'store']);
    Route::put('/questions/{question}', [QuestionController::class, 'update']);
    Route::delete('/questions/{question}', [QuestionController::class, 'destroy']);
    Route::post('/questions/{question}/vote', [QuestionController::class, 'vote']);
    
    // Answers
    Route::post('/questions/{question}/answers', [AnswerController::class, 'store']);
    Route::put('/answers/{answer}', [AnswerController::class, 'update']);
    Route::delete('/answers/{answer}', [AnswerController::class, 'destroy']);
    Route::post('/answers/{answer}/vote', [AnswerController::class, 'vote']);
    Route::post('/answers/{answer}/accept', [AnswerController::class, 'accept']);
    
    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Admin Routes
Route::group([
    'prefix' => 'v1/admin',
    'middleware' => ['auth:sanctum', 'admin'],
], function () {
    // Categories Management
    Route::apiResource('categories', CategoryController::class);
    Route::post('categories/order', [CategoryController::class, 'updateOrder']);
    Route::post('categories/{category}/toggle-active', [CategoryController::class, 'toggleActive']);
    
    // Products Management
    Route::apiResource('products', ProductController::class);
    Route::post('products/{product}/toggle-active', [ProductController::class, 'toggleActive']);
    Route::post('products/{product}/toggle-featured', [ProductController::class, 'toggleFeatured']);
    Route::post('products/{product}/images', [ProductController::class, 'uploadImages']);
    Route::delete('products/{product}/images/{image}', [ProductController::class, 'deleteImage']);
    
    // Orders Management
    Route::get('orders', [OrderController::class, 'adminIndex']);
    Route::get('orders/{order}', [OrderController::class, 'adminShow']);
    Route::post('orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::post('orders/{order}/shipping', [OrderController::class, 'updateShipping']);
    
    // Users Management
    Route::apiResource('users', UserController::class);
    Route::post('users/{user}/toggle-active', [UserController::class, 'toggleActive']);
    
    // Statistics & Reports
    Route::get('stats/dashboard', [AdminController::class, 'dashboardStats']);
    Route::get('stats/sales', [AdminController::class, 'salesStats']);
    Route::get('stats/products', [AdminController::class, 'productStats']);
    Route::get('stats/users', [AdminController::class, 'userStats']);
});