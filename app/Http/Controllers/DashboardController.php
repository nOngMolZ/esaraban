<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentSigner;
use App\Models\DocumentRecipient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * แสดงหน้า Dashboard ตามบทบาทของผู้ใช้
     */
    public function index(): Response
    {
        $user = Auth::user();
        $userRole = $user->role?->name;
        $userPosition = $user->position?->name;
        
        // ข้อมูลพื้นฐานสำหรับทุกบทบาท
        $dashboardData = [
            'user' => $user,
            'userRole' => $userRole,
            'userPosition' => $userPosition,
        ];

        // แสดงเอกสารตามบทบาท
        switch ($userRole) {
            case 'ผู้อำนวยการ':
                $dashboardData = array_merge($dashboardData, $this->getDirectorDashboard($user));
                break;
                
            case 'รองผู้อำนวยการ':
                $dashboardData = array_merge($dashboardData, $this->getDeputyDirectorDashboard($user));
                break;
                
            case 'สารบัญ':
                $dashboardData = array_merge($dashboardData, $this->getSarabunDashboard($user));
                break;
                
            default:
                $dashboardData = array_merge($dashboardData, $this->getGeneralUserDashboard($user));
                break;
        }

        return Inertia::render('dashboard', $dashboardData);
    }

    /**
     * Dashboard สำหรับผู้อำนวยการ
     */
    private function getDirectorDashboard($user): array
    {
        // เอกสารที่รอลงนาม
        $pendingDocuments = DocumentSigner::where('user_id', $user->id)
            ->where('status', 'waiting')
            ->with(['document.documentType', 'document.user'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // เอกสารที่ลงนามแล้ว (ล่าสุด)
        $signedDocuments = DocumentSigner::where('user_id', $user->id)
            ->whereIn('status', ['signed', 'completed'])
            ->with(['document.documentType', 'document.user'])
            ->orderBy('signed_at', 'desc')
            ->take(5)
            ->get();

        // สถิติ
        $stats = [
            'pending_count' => DocumentSigner::where('user_id', $user->id)
                ->where('status', 'waiting')
                ->count(),
            'signed_count' => DocumentSigner::where('user_id', $user->id)
                ->whereIn('status', ['signed', 'completed'])
                ->count(),
            'total_documents' => Document::count(),
            'completed_documents' => Document::where('status', 'completed')->count(),
        ];

        return [
            'dashboardType' => 'director',
            'pendingDocuments' => $pendingDocuments,
            'signedDocuments' => $signedDocuments,
            'stats' => $stats,
        ];
    }

    /**
     * Dashboard สำหรับรองผู้อำนวยการ
     */
    private function getDeputyDirectorDashboard($user): array
    {
        // เอกสารที่รอลงนาม
        $pendingDocuments = DocumentSigner::where('user_id', $user->id)
            ->where('status', 'waiting')
            ->with(['document.documentType', 'document.user'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // เอกสารที่ลงนามแล้ว (ล่าสุด)
        $signedDocuments = DocumentSigner::where('user_id', $user->id)
            ->whereIn('status', ['signed', 'completed'])
            ->with(['document.documentType', 'document.user'])
            ->orderBy('signed_at', 'desc')
            ->take(5)
            ->get();

        // สถิติ
        $stats = [
            'pending_count' => DocumentSigner::where('user_id', $user->id)
                ->where('status', 'waiting')
                ->count(),
            'signed_count' => DocumentSigner::where('user_id', $user->id)
                ->whereIn('status', ['signed', 'completed'])
                ->count(),
            'total_documents' => Document::count(),
            'completed_documents' => Document::where('status', 'completed')->count(),
        ];

        return [
            'dashboardType' => 'deputy_director',
            'pendingDocuments' => $pendingDocuments,
            'signedDocuments' => $signedDocuments,
            'stats' => $stats,
        ];
    }

    /**
     * Dashboard สำหรับเจ้าหน้าที่สารบรรณ
     */
    private function getSarabunDashboard($user): array
    {
        // เอกสารที่สร้างโดยผู้ใช้
        $myDocuments = Document::where('user_id', $user->id)
            ->with(['documentType', 'user'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // เอกสารที่รอกระจาย
        $pendingDistribution = Document::where('status', 'pending_distribution')
            ->where('user_id', $user->id)
            ->with(['documentType', 'user'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // เอกสารที่ได้รับมอบหมายให้จัดการ
        $assignedDocuments = DocumentSigner::where('user_id', $user->id)
            ->where('signer_type', 'operational_phase')
            ->where('status', 'waiting')
            ->with(['document.documentType', 'document.user'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // สถิติ
        $stats = [
            'my_documents_count' => Document::where('user_id', $user->id)->count(),
            'pending_distribution_count' => Document::where('status', 'pending_distribution')
                ->where('user_id', $user->id)
                ->count(),
            'assigned_documents_count' => DocumentSigner::where('user_id', $user->id)
                ->where('signer_type', 'operational_phase')
                ->where('status', 'waiting')
                ->count(),
            'completed_documents_count' => Document::where('user_id', $user->id)
                ->where('status', 'completed')
                ->count(),
        ];

        return [
            'dashboardType' => 'sarabun',
            'myDocuments' => $myDocuments,
            'pendingDistribution' => $pendingDistribution,
            'assignedDocuments' => $assignedDocuments,
            'stats' => $stats,
        ];
    }

    /**
     * Dashboard สำหรับผู้ใช้ทั่วไป
     */
    private function getGeneralUserDashboard($user): array
    {
        // เอกสารที่ได้รับ
        $receivedDocuments = DocumentRecipient::where('user_id', $user->id)
            ->with(['document.documentType', 'document.user'])
            ->whereHas('document', function ($q) {
                $q->where('status', 'completed');
            })
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // เอกสารที่ได้รับมอบหมายให้จัดการ
        $assignedDocuments = DocumentSigner::where('user_id', $user->id)
            ->where('status', 'waiting')
            ->with(['document.documentType', 'document.user'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // เอกสารสาธารณะล่าสุด
        $publicDocuments = Document::where('is_public', true)
            ->where('access_type', 'public')
            ->where('status', 'completed')
            ->with(['documentType', 'user'])
            ->orderBy('completed_at', 'desc')
            ->take(5)
            ->get();

        // สถิติ
        $stats = [
            'received_count' => DocumentRecipient::where('user_id', $user->id)
                ->whereHas('document', function ($q) {
                    $q->where('status', 'completed');
                })
                ->count(),
            'unread_count' => DocumentRecipient::where('user_id', $user->id)
                ->whereNull('accessed_at')
                ->whereHas('document', function ($q) {
                    $q->where('status', 'completed');
                })
                ->count(),
            'assigned_count' => DocumentSigner::where('user_id', $user->id)
                ->where('status', 'waiting')
                ->count(),
            'public_documents_count' => Document::where('is_public', true)
                ->where('access_type', 'public')
                ->where('status', 'completed')
                ->count(),
        ];

        return [
            'dashboardType' => 'general',
            'receivedDocuments' => $receivedDocuments,
            'assignedDocuments' => $assignedDocuments,
            'publicDocuments' => $publicDocuments,
            'stats' => $stats,
        ];
    }
} 