<?php

namespace App\Services;

use App\Models\Document;
use Illuminate\Support\Facades\Log;
use setasign\Fpdi\Tcpdf\Fpdi;

class PdfService
{
    public function insertStampsToPdf(Document $document, array $stamps): string
    {
        Log::info('PdfService: Starting insertStampsToPdf', [
            'document_id' => $document->id,
            'stamps_count' => count($stamps)
        ]);

        try {
            $currentPdfPath = storage_path('app/public/' . ($document->current_file_path ?? $document->file_path));

            if (!file_exists($currentPdfPath)) {
                Log::error('PdfService: PDF file not found', ['path' => $currentPdfPath]);
                throw new \Exception('ไฟล์ PDF ไม่พบในระบบ');
            }

            $pdf = new Fpdi();
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);
            $pageCount = $pdf->setSourceFile($currentPdfPath);

            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                $templateId = $pdf->importPage($pageNo);
                $size = $pdf->getTemplateSize($templateId);
                $orientation = ($size['width'] > $size['height']) ? 'L' : 'P';

                $pdf->AddPage($orientation, [$size['width'], $size['height']]);
                $pdf->useTemplate($templateId);

                foreach ($stamps as $index => $stamp) {
                    if (!isset($stamp['position'])) {
                        Log::warning('PdfService: Stamp position data not found', ['index' => $index, 'stamp_id' => $stamp['id'] ?? 'N/A']);
                        continue;
                    }

                    $targetPageIndex = isset($stamp['position']['pageIndex']) ? (int)$stamp['position']['pageIndex'] : 0;
                    if ($targetPageIndex === ($pageNo - 1)) {
                        try {
                            // ดึงไฟล์ตราประทับ
                            $stampImagePath = null;
                            if (isset($stamp['imageUrl'])) {
                                // แปลง URL เป็น path
                                $stampImagePath = str_replace('/storage/', '', parse_url($stamp['imageUrl'], PHP_URL_PATH));
                                $stampImagePath = storage_path('app/public/' . $stampImagePath);
                            }

                            if (!$stampImagePath || !file_exists($stampImagePath)) {
                                Log::warning('PdfService: Stamp image file not found', [
                                    'index' => $index,
                                    'stamp_id' => $stamp['id'] ?? 'N/A',
                                    'path' => $stampImagePath
                                ]);
                                continue;
                            }

                            // ดึงค่าตำแหน่งและขนาดจาก frontend
                            $stampX = isset($stamp['position']['x']) ? (float)$stamp['position']['x'] : 0;
                            $stampY = isset($stamp['position']['y']) ? (float)$stamp['position']['y'] : 0;
                            $stampWidth = isset($stamp['position']['width']) ? (float)$stamp['position']['width'] : 50;
                            $stampHeight = isset($stamp['position']['height']) ? (float)$stamp['position']['height'] : 50;
                            $stampRotation = isset($stamp['position']['rotation']) ? (float)$stamp['position']['rotation'] : 0;

                            // ขนาด PDF จริงจาก frontend
                            $pdfWidth = isset($stamp['position']['pdfWidth']) ? (float)$stamp['position']['pdfWidth'] : $size['width'];
                            $pdfHeight = isset($stamp['position']['pdfHeight']) ? (float)$stamp['position']['pdfHeight'] : $size['height'];

                            // คำนวณอัตราการแปลงหน่วย (PDF points to mm)
                            $ratioX = $size['width'] / $pdfWidth;
                            $ratioY = $size['height'] / $pdfHeight;

                            // แปลงตำแหน่งและขนาดเป็น mm
                            $x_mm = $stampX * $ratioX;
                            $y_mm = $stampY * $ratioY;
                            $width_mm = $stampWidth * $ratioX;
                            $height_mm = $stampHeight * $ratioY;

                            // ตรวจสอบขอบเขต
                            if ($x_mm < 0) $x_mm = 0;
                            if ($y_mm < 0) $y_mm = 0;
                            if (($x_mm + $width_mm) > $size['width']) {
                                $width_mm = $size['width'] - $x_mm;
                            }
                            if (($y_mm + $height_mm) > $size['height']) {
                                $height_mm = $size['height'] - $y_mm;
                            }

                            Log::info('PdfService: Adding stamp to PDF', [
                                'index' => $index,
                                'stamp_id' => $stamp['id'] ?? 'N/A',
                                'page' => $pageNo,
                                'position_mm' => ['x' => $x_mm, 'y' => $y_mm, 'width' => $width_mm, 'height' => $height_mm],
                                'rotation' => $stampRotation
                            ]);

                            // เพิ่มตราประทับลงใน PDF
                            if ($stampRotation != 0) {
                                $pdf->StartTransform();
                                $pdf->Rotate($stampRotation, $x_mm + $width_mm/2, $y_mm + $height_mm/2);
                            }

                            $pdf->Image($stampImagePath, $x_mm, $y_mm, $width_mm, $height_mm, '', '', '', false, 300, '', false, false, 0, false, false, false);

                            if ($stampRotation != 0) {
                                $pdf->StopTransform();
                            }

                        } catch (\Exception $e) {
                            Log::error('PdfService: Error processing stamp', [
                                'index' => $index,
                                'stamp_id' => $stamp['id'] ?? 'N/A',
                                'error' => $e->getMessage()
                            ]);
                        }
                    }
                }
            }

            // บันทึกไฟล์ PDF ใหม่
            $dateFolderName = 'documents/' . date('Y/m');
            $storagePath = storage_path('app/public/' . $dateFolderName);
            if (!file_exists($storagePath)) {
                if (!mkdir($storagePath, 0755, true)) {
                    Log::error('PdfService: Failed to create directory for stamped PDF', ['path' => $storagePath]);
                    throw new \Exception('ไม่สามารถสร้างไดเรกทอรีสำหรับบันทึกไฟล์ PDF ที่มีตราประทับได้');
                }
            }

            $newFileName = $dateFolderName . '/stamped_' . uniqid() . '_' . $document->id . '.pdf';
            $newFilePath = storage_path('app/public/' . $newFileName);

            $pdf->Output($newFilePath, 'F');

            if (!file_exists($newFilePath)) {
                Log::error('PdfService: Failed to create stamped PDF file', ['path' => $newFilePath]);
                throw new \Exception('ไม่สามารถสร้างไฟล์ PDF ที่มีตราประทับได้');
            }

            Log::info('PdfService: Successfully created stamped PDF', [
                'document_id' => $document->id,
                'new_file_path' => $newFileName,
                'file_size' => filesize($newFilePath)
            ]);

            return $newFileName;

        } catch (\Exception $e) {
            Log::error('PdfService: Failed to create stamped PDF', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function insertSignaturesToPdf(Document $document, array $signatures): string
    {
        Log::info('PdfService: Starting insertSignaturesToPdf', [
            'document_id' => $document->id,
            'signatures_count' => count($signatures)
        ]);

        try {
            $currentPdfPath = storage_path('app/public/' . $document->current_file_path);

            if (!file_exists($currentPdfPath)) {
                Log::error('PdfService: PDF file not found', ['path' => $currentPdfPath]);
                throw new \Exception('ไฟล์ PDF ไม่พบในระบบ');
            }

            $pdf = new Fpdi();
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);
            $pageCount = $pdf->setSourceFile($currentPdfPath);

            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                $templateId = $pdf->importPage($pageNo);
                $size = $pdf->getTemplateSize($templateId); // $size['width'], $size['height'] คือขนาดหน้า PDF จริงในหน่วย mm
                $orientation = ($size['width'] > $size['height']) ? 'L' : 'P';

                $pdf->AddPage($orientation, [$size['width'], $size['height']]);
                $pdf->useTemplate($templateId);

                foreach ($signatures as $index => $signature) {
                    if (!isset($signature['position'])) {
                        Log::warning('PdfService: Signature position data not found', ['index' => $index, 'signature_id' => $signature['id'] ?? 'N/A']);
                        continue;
                    }

                    $targetPageIndex = isset($signature['position']['pageIndex']) ? (int)$signature['position']['pageIndex'] : -1;
                    if ($targetPageIndex === ($pageNo - 1)) {
                        if (!isset($signature['imageData']) || empty($signature['imageData'])) {
                            Log::warning('PdfService: Signature image data empty', ['index' => $index, 'signature_id' => $signature['id'] ?? 'N/A']);
                            continue;
                        }

                        $tempFile = null; // Initialize tempFile to null
                        try {
                            $base64Data = $signature['imageData'];
                            if (strpos($signature['imageData'], 'data:image') === 0) {
                                $base64Data = substr($signature['imageData'], strpos($signature['imageData'], ',') + 1);
                            }
                            $imgData = base64_decode($base64Data, true);

                            if ($imgData === false) {
                                Log::error('PdfService: Failed to decode base64 image', ['index' => $index, 'signature_id' => $signature['id'] ?? 'N/A', 'data_prefix' => substr($signature['imageData'] ?? '', 0, 30)]);
                                continue;
                            }

                            // --- Attempt to re-process with GD to ensure transparency ---
                            if (function_exists('imagecreatefromstring')) {
                                $gdImage = @imagecreatefromstring($imgData);
                                if ($gdImage !== false) {
                                    $originalWidth = imagesx($gdImage);
                                    $originalHeight = imagesy($gdImage);

                                    // Create a new true color image
                                    $trueColorImage = imagecreatetruecolor($originalWidth, $originalHeight);

                                    if ($trueColorImage === false) {
                                        Log::warning('PdfService: GD imagecreatetruecolor failed. Using original image data.', ['index' => $index, 'signature_id' => $signature['id'] ?? 'N/A']);
                                        imagedestroy($gdImage); // Clean up the initially created image
                                    } else {
                                        // Set blending mode to off and save alpha channel
                                        imagealphablending($trueColorImage, false);
                                        imagesavealpha($trueColorImage, true);

                                        // Create a transparent color
                                        $transparentColor = imagecolorallocatealpha($trueColorImage, 0, 0, 0, 127); // 127 = fully transparent

                                        // Fill the new image with the transparent color
                                        imagefill($trueColorImage, 0, 0, $transparentColor);

                                        // Copy the original image onto the new transparent canvas
                                        // This preserves the visual content, including its own alpha, if any
                                        imagecopyresampled(
                                            $trueColorImage, // Destination image
                                            $gdImage,        // Source image
                                            0, 0,            // Destination x, y
                                            0, 0,            // Source x, y
                                            $originalWidth, $originalHeight, // Destination width, height
                                            $originalWidth, $originalHeight  // Source width, height
                                        );
                                        imagedestroy($gdImage); // Free the original image resource

                                        ob_start(); // Start output buffering
                                        $success = imagepng($trueColorImage, null, 9); // Output PNG to buffer, 0 (no compression) to 9 (max)
                                        $processedImgData = ob_get_clean(); // Get content from buffer and clean buffer
                                        imagedestroy($trueColorImage); // Free the truecolor image resource

                                        if ($success && !empty($processedImgData)) {
                                            $imgData = $processedImgData; // Replace original imgData with GD-processed data
                                            Log::info('PdfService: Signature image re-processed with GD to ensure transparency.', ['index' => $index, 'signature_id' => $signature['id'] ?? 'N/A']);
                                        } else {
                                            Log::warning('PdfService: GD imagepng processing failed or produced empty data. Using original image data.', ['index' => $index, 'signature_id' => $signature['id'] ?? 'N/A']);
                                            // $imgData remains original
                                        }
                                    }
                                } else {
                                     Log::warning('PdfService: imagecreatefromstring failed with current image data. Using original image data.', ['index' => $index, 'signature_id' => $signature['id'] ?? 'N/A']);
                                     // $imgData remains original
                                }
                            } elseif ($imgData !== false) { // Only log if imgData was valid but GD is not available
                                Log::info('PdfService: GD extension not available. Using original image data for signature.', ['index' => $index, 'signature_id' => $signature['id'] ?? 'N/A']);
                            }
                            // --- End GD re-processing ---

                            $tempFile = tempnam(sys_get_temp_dir(), 'sig_'); // Added underscore for clarity
                            if ($tempFile === false) {
                                Log::error('PdfService: Failed to create temporary file name.', ['index' => $index, 'signature_id' => $signature['id'] ?? 'N/A']);
                                continue;
                            }
                            file_put_contents($tempFile, $imgData);

                            if (!file_exists($tempFile) || filesize($tempFile) <= 0) {
                                Log::error('PdfService: Temp file not created or empty after writing', ['path' => $tempFile, 'index' => $index, 'signature_id' => $signature['id'] ?? 'N/A']);
                                if (file_exists($tempFile)) unlink($tempFile);
                                continue;
                            }

                            // ดึงค่าตำแหน่งและขนาดจาก frontend (ในหน่วย px)
                            $sigX_px = isset($signature['position']['x']) ? (float)$signature['position']['x'] : 0;
                            $sigY_px = isset($signature['position']['y']) ? (float)$signature['position']['y'] : 0;
                            $sigWidth_px = isset($signature['position']['width']) ? (float)$signature['position']['width'] : 0;
                            $sigHeight_px = isset($signature['position']['height']) ? (float)$signature['position']['height'] : 0;
                            $sigRotation = isset($signature['position']['rotation']) ? (float)$signature['position']['rotation'] : 0;

                            // ดึงขนาดของ PDF container จาก frontend (ที่ส่งมาใหม่)
                            $frontendPdfViewWidthPx = isset($signature['position']['frontendPdfViewWidthPx']) ? (float)$signature['position']['frontendPdfViewWidthPx'] : 0;
                            $frontendPdfViewHeightPx = isset($signature['position']['frontendPdfViewHeightPx']) ? (float)$signature['position']['frontendPdfViewHeightPx'] : 0;

                            Log::info('PdfService: Received signature data from frontend', [
                                'index' => $index,
                                'signature_id' => $signature['id'] ?? 'N/A',
                                'pageIndex' => $targetPageIndex,
                                'px_position' => ['x' => $sigX_px, 'y' => $sigY_px, 'width' => $sigWidth_px, 'height' => $sigHeight_px, 'rotation' => $sigRotation],
                                'frontend_view_px' => ['width' => $frontendPdfViewWidthPx, 'height' => $frontendPdfViewHeightPx],
                                'pdf_page_size_mm' => ['width' => $size['width'], 'height' => $size['height']]
                            ]);

                            // ขนาดหน้า PDF จริงในหน่วย mm
                            $pageWidthMm = $size['width'];
                            $pageHeightMm = $size['height'];

                            // คำนวณอัตราการแปลงหน่วย
                            $ratioX = 1.0; // Default ratio
                            $ratioY = 1.0; // Default ratio

                            if ($frontendPdfViewWidthPx > 0) {
                                $ratioX = $pageWidthMm / $frontendPdfViewWidthPx;
                            } else {
                                Log::warning('PdfService: frontendPdfViewWidthPx is zero or not provided. RatioX will be 1.0.', [
                                    'index' => $index,
                                    'signature_id' => $signature['id'] ?? 'N/A',
                                    'frontendPdfViewWidthPx' => $frontendPdfViewWidthPx
                                ]);
                            }

                            if ($frontendPdfViewHeightPx > 0) {
                                $ratioY = $pageHeightMm / $frontendPdfViewHeightPx;
                            } else {
                                Log::warning('PdfService: frontendPdfViewHeightPx is zero or not provided. RatioY will be 1.0.', [
                                    'index' => $index,
                                    'signature_id' => $signature['id'] ?? 'N/A',
                                    'frontendPdfViewHeightPx' => $frontendPdfViewHeightPx
                                ]);
                            }

                            // --- การปรับปรุงเรื่องสัดส่วน ---
                            // แปลงตำแหน่งโดยใช้ ratio ของแต่ละแกน
                            $x_mm = $sigX_px * $ratioX;
                            $y_mm = $sigY_px * $ratioY;

                            // คำนวณความกว้างในหน่วย mm โดยใช้ ratioX
                            $width_mm = $sigWidth_px * $ratioX;

                            // คำนวณความสูงในหน่วย mm โดยรักษาสัดส่วนเดิมของลายเซ็น (อิงจากความกว้างที่แปลงแล้ว)
                            if ($sigWidth_px > 0) {
                                $originalAspectRatio = $sigHeight_px / $sigWidth_px;
                                $height_mm = $width_mm * $originalAspectRatio;
                            } else if ($sigHeight_px > 0) { // Fallback กรณี width_px เป็น 0 แต่ height_px ไม่เป็น
                                // ถ้า sigWidth_px เป็น 0, ลองคำนวณ width_mm จาก height_mm แทน ถ้าต้องการ
                                // หรือใช้ ratioY สำหรับ height_mm โดยตรง (ซึ่งอาจทำให้สัดส่วนเพี้ยนถ้า sigWidth_px เป็น 0)
                                $height_mm = $sigHeight_px * $ratioY; // หรือ $ratioX ถ้าเชื่อว่าควรใช้ ratio เดียว
                                Log::warning('PdfService: sigWidth_px was zero. Calculated height_mm based on sigHeight_px and a chosen ratio.', [
                                    'index' => $index,
                                    'signature_id' => $signature['id'] ?? 'N/A',
                                    'sigHeight_px' => $sigHeight_px,
                                    'chosen_ratio_for_height' => $ratioY
                                ]);
                            } else {
                                // กรณีทั้ง sigWidth_px และ sigHeight_px เป็น 0 (ลายเซ็นไม่มีขนาด)
                                $height_mm = 0;
                                Log::warning('PdfService: Both sigWidth_px and sigHeight_px were zero. Resulting height_mm is 0.', ['index' => $index, 'signature_id' => $signature['id'] ?? 'N/A']);
                            }
                            // --- สิ้นสุดการปรับปรุงเรื่องสัดส่วน ---

                            Log::info('PdfService: Converted position to mm (with aspect ratio preservation attempt)', [
                                'index' => $index,
                                'signature_id' => $signature['id'] ?? 'N/A',
                                'mm_position' => ['x' => $x_mm, 'y' => $y_mm, 'width' => $width_mm, 'height' => $height_mm],
                                'page_size_mm' => ['width' => $pageWidthMm, 'height' => $pageHeightMm],
                                'conversion_ratios_used' => ['pos_x' => $ratioX, 'pos_y' => $ratioY, 'width' => $ratioX, 'height_aspect_based_on_width' => true]
                            ]);

                            // ตรวจสอบและปรับค่าไม่ให้เกินขอบเขตหน้า PDF และป้องกันขนาดเป็นศูนย์หรือติดลบ
                            if ($x_mm < 0) $x_mm = 0;
                            if ($y_mm < 0) $y_mm = 0;

                            // ทำให้แน่ใจว่า width และ height มีค่าอย่างน้อยที่สุด (เช่น 1mm) ถ้ามันเคยมีค่า > 0 ในหน่วย px
                            if ($sigWidth_px > 0 && $width_mm <= 0) $width_mm = 0.1; // ค่าเล็กน้อยเพื่อไม่ให้เป็นศูนย์
                            if ($sigHeight_px > 0 && $height_mm <= 0) $height_mm = 0.1;

                            if (($x_mm + $width_mm) > $pageWidthMm) {
                                $width_mm = $pageWidthMm - $x_mm;
                            }
                            if (($y_mm + $height_mm) > $pageHeightMm) {
                                $height_mm = $pageHeightMm - $y_mm;
                            }

                            // ถ้าหลังจากการปรับขอบเขตแล้ว width หรือ height กลายเป็น 0 หรือติดลบ ให้ข้ามไป
                            if ($width_mm <= 0 || $height_mm <= 0) {
                                Log::warning('PdfService: Signature dimensions became zero or negative after boundary adjustment. Skipping signature.', [
                                    'index' => $index,
                                    'signature_id' => $signature['id'] ?? 'N/A',
                                    'final_mm_dimensions' => ['width' => $width_mm, 'height' => $height_mm]
                                ]);
                                if (file_exists($tempFile)) unlink($tempFile);
                                continue;
                            }

                            if ($sigRotation != 0) {
                                $pdf->StartTransform();
                                $centerX_mm = $x_mm + ($width_mm / 2);
                                $centerY_mm = $y_mm + ($height_mm / 2);
                                $pdf->Rotate($sigRotation, $centerX_mm, $centerY_mm);
                                $pdf->Image($tempFile, $x_mm, $y_mm, $width_mm, $height_mm, '', '', '', true, 300, '', false, false, 0, false, false, false);
                                $pdf->StopTransform();
                            } else {
                                $pdf->Image($tempFile, $x_mm, $y_mm, $width_mm, $height_mm, '', '', '', true, 300, '', false, false, 0, false, false, false);
                            }

                            if (file_exists($tempFile)) unlink($tempFile);
                        } catch (\Exception $e) {
                            Log::error('PdfService: Error processing one signature during PDF generation', [
                                'index' => $index,
                                'signature_id' => $signature['id'] ?? 'N/A',
                                'error' => $e->getMessage(),
                                'trace_snippet' => substr($e->getTraceAsString(), 0, 500)
                            ]);
                            if (isset($tempFile) && file_exists($tempFile)) {
                                unlink($tempFile);
                            }
                            // ขึ้นอยู่กับว่าต้องการให้หยุดทั้งหมดหรือไม่ ถ้าไม่ ให้ continue
                            // throw $e; // หากต้องการให้หยุดการทำงานทั้งหมดและแจ้งข้อผิดพลาด
                        }
                    }
                }
            }

            $dateFolderName = 'documents/' . date('Y/m');
            $storagePath = storage_path('app/public/' . $dateFolderName);
            if (!file_exists($storagePath)) {
                if (!mkdir($storagePath, 0755, true)) {
                    Log::error('PdfService: Failed to create directory for signed PDF', ['path' => $storagePath]);
                    throw new \Exception('ไม่สามารถสร้างไดเรกทอรีสำหรับบันทึกไฟล์ PDF ที่ลงนามแล้วได้');
                }
            }
            $newFileName = $dateFolderName . '/signed_' . uniqid() . '_' . $document->id . '.pdf';
            $newFilePath = storage_path('app/public/' . $newFileName);

            $pdf->Output($newFilePath, 'F');
            Log::info('PdfService: Successfully created signed PDF.', ['path' => $newFilePath]);
            return $newFileName;
        } catch (\Exception $e) {
            Log::error('PdfService: General error in insertSignaturesToPdf function', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e; // Rethrowเพื่อให้ controller หรือ global error handler จัดการ
        }
    }
}
