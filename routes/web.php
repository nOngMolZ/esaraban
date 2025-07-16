<?php

use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentSigningController;
use App\Http\Controllers\DocumentDistributionController;
use App\Http\Controllers\DocumentStampController;
use App\Http\Controllers\DocumentFinalReviewController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Models\Document;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing page
Route::get('/', function () {
    $publicDocuments = Document::with('documentType')
        ->where('is_public', true)
        ->orderBy('created_at', 'desc')
        ->take(6)
        ->get();

    return Inertia::render('welcome', [
        'publicDocuments' => $publicDocuments
    ]);
})->name('home');

// route สำหรับหน้าเอกสารสาธารณะทั้งหมด
Route::get('/documents/public', [DocumentController::class, 'publicIndex'])
    ->name('documents.public');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // เส้นทางหลักสำหรับเอกสาร
    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::get('/documents/add', [DocumentController::class, 'create'])->name('documents.create');
    Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');
    Route::get('/documents/{document}/edit', [DocumentController::class, 'edit'])->name('documents.edit');
    Route::put('/documents/{document}', [DocumentController::class, 'update'])->name('documents.update');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
    
    // Phase 3: Document Distribution Routes
    Route::get('/documents/{document}/distribute', [DocumentDistributionController::class, 'show'])
        ->name('documents.distribute.show');
    Route::post('/documents/{document}/distribute', [DocumentDistributionController::class, 'store'])
        ->name('documents.distribute.store');
    
    // Phase 3: Stamp Management Routes  
    Route::get('/documents/{document}/manage-stamps', [DocumentStampController::class, 'show'])
        ->name('documents.stamps.show');
    Route::post('/documents/{document}/stamps/save', [DocumentStampController::class, 'save'])
        ->name('documents.stamps.save');

    // Phase 4: Final Review Routes
    Route::get('/documents/{document}/final-review', [DocumentFinalReviewController::class, 'show'])
        ->name('documents.final-review.show');
    Route::post('/documents/{document}/complete', [DocumentFinalReviewController::class, 'complete'])
        ->name('documents.final-review.complete');
    
    // Document Access Routes  
    Route::get('/documents/{document}/view-only', [DocumentFinalReviewController::class, 'viewOnly'])
        ->name('documents.view-only');

    // เพิ่ม route ใหม่สำหรับการตั้งค่าการเข้าถึงและเสร็จสิ้นกระบวนการ
    Route::post('/documents/{document}/set-access-and-complete', [DocumentController::class, 'setAccessAndComplete'])
        ->name('documents.set-access-and-complete');

    // เส้นทางสำหรับการลงนามเอกสาร
    Route::get('/documents/{document}/sign', [DocumentSigningController::class, 'showSignForm'])
        ->name('documents.sign');
    Route::post('/documents/{document}/sign/save', [DocumentSigningController::class, 'saveSignature'])
        ->name('documents.sign.save');
    Route::post('/documents/{document}/sign/reject', [DocumentSigningController::class, 'rejectSignature'])
        ->name('documents.sign.reject');
        
    // Notification routes
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('/recent', [NotificationController::class, 'recent'])->name('recent');
        Route::post('/{notification}/mark-read', [NotificationController::class, 'markAsRead'])->name('mark-read');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('destroy');
        Route::delete('/', [NotificationController::class, 'destroyAll'])->name('destroy-all');
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCount'])->name('unread-count');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';
