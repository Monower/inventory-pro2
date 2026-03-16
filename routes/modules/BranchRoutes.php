<?php

use App\Http\Controllers\BranchController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('/branches', [BranchController::class, 'index'])->name('branches.index')->middleware('permission:view branch');
    Route::patch('/branches/switch', [BranchController::class, 'switch'])->name('branches.switch');
    Route::get('/branch/create', [BranchController::class, 'create'])->name('branch.create')->middleware('permission:create branch');
    Route::post('/branch/create', [BranchController::class, 'store'])->name('branch.store')->middleware('permission:create branch');
    Route::get('/branch/edit/{branch_id}', [BranchController::class, 'edit'])->name('branch.edit')->middleware('permission:edit branch');
    Route::put('/branch/edit/{branch_id}', [BranchController::class, 'update'])->name('branch.update')->middleware('permission:edit branch');
    Route::delete('/branch/delete/{branch_id}', [BranchController::class, 'destroy'])->name('branch.destroy')->middleware('permission:delete branch');
});
