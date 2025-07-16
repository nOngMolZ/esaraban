<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\PositionController;
use App\Http\Controllers\Admin\DocumentTypeController;
use App\Http\Controllers\Admin\StampController;
use App\Http\Controllers\Admin\FixedSignerController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // User management routes
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::patch('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    
    // Department management routes
    Route::get('/departments', [DepartmentController::class, 'index'])->name('departments.index');
    Route::get('/departments/create', [DepartmentController::class, 'create'])->name('departments.create');
    Route::post('/departments', [DepartmentController::class, 'store'])->name('departments.store');
    Route::get('/departments/{department}', [DepartmentController::class, 'show'])->name('departments.show');
    Route::get('/departments/{department}/edit', [DepartmentController::class, 'edit'])->name('departments.edit');
    Route::patch('/departments/{department}', [DepartmentController::class, 'update'])->name('departments.update');
    Route::delete('/departments/{department}', [DepartmentController::class, 'destroy'])->name('departments.destroy');
    
    // Position management routes
    Route::get('/positions', [PositionController::class, 'index'])->name('positions.index');
    Route::get('/positions/create', [PositionController::class, 'create'])->name('positions.create');
    Route::post('/positions', [PositionController::class, 'store'])->name('positions.store');
    Route::get('/positions/{position}', [PositionController::class, 'show'])->name('positions.show');
    Route::get('/positions/{position}/edit', [PositionController::class, 'edit'])->name('positions.edit');
    Route::patch('/positions/{position}', [PositionController::class, 'update'])->name('positions.update');
    Route::delete('/positions/{position}', [PositionController::class, 'destroy'])->name('positions.destroy');
    
    // Document Type management routes
    Route::get('/document-types', [DocumentTypeController::class, 'index'])->name('document-types.index');
    Route::get('/document-types/create', [DocumentTypeController::class, 'create'])->name('document-types.create');
    Route::post('/document-types', [DocumentTypeController::class, 'store'])->name('document-types.store');
    Route::get('/document-types/{documentType}', [DocumentTypeController::class, 'show'])->name('document-types.show');
    Route::get('/document-types/{documentType}/edit', [DocumentTypeController::class, 'edit'])->name('document-types.edit');
    Route::patch('/document-types/{documentType}', [DocumentTypeController::class, 'update'])->name('document-types.update');
    Route::delete('/document-types/{documentType}', [DocumentTypeController::class, 'destroy'])->name('document-types.destroy');
    
    // Stamp management routes - ต้องมี permission manage_stamps
    Route::middleware('permission:manage_stamps')->group(function () {
        Route::resource('stamps', StampController::class);
    });
    
    // Fixed Signers management routes
    Route::get('/fixed-signers', [FixedSignerController::class, 'index'])->name('fixed-signers.index');
    Route::post('/fixed-signers', [FixedSignerController::class, 'store'])->name('fixed-signers.store');
    Route::patch('/fixed-signers/{fixedSigner}/priority', [FixedSignerController::class, 'updatePriority'])->name('fixed-signers.update-priority');
    Route::patch('/fixed-signers/{fixedSigner}/toggle', [FixedSignerController::class, 'toggleActive'])->name('fixed-signers.toggle');
    Route::delete('/fixed-signers/{fixedSigner}', [FixedSignerController::class, 'destroy'])->name('fixed-signers.destroy');
}); 