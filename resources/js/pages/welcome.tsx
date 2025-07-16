// resources/js/pages/welcome.tsx
import { type SharedData, type Document } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Welcome() {
    const { auth, publicDocuments } = usePage<SharedData & {
        publicDocuments: Document[]
    }>().props;

    // ฟังก์ชันสำหรับแปลงวันที่เป็นรูปแบบไทย
    const formatThaiDate = (dateString: string) => {
        const date = new Date(dateString);
        const thaiMonths = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        const day = date.getDate();
        const month = thaiMonths[date.getMonth()];
        const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
        return `${day} ${month} ${year}`;
    };

    return (
        <>
            <Head title="ระบบสารบรรณอิเล็กทรอนิกส์">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen flex-col bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                {/* ส่วนหัว */}
                <header className="bg-white dark:bg-[#161615] shadow-sm px-6 py-4">
                    <div className="container mx-auto flex justify-between items-center">
                        <h1 className="text-xl font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                            โรงเรียนชุมแสงชนูทิศ
                        </h1>
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    เข้าสู่ระบบงาน
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        เข้าสู่ระบบ
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ส่วนแนะนำระบบ */}
                <section className="bg-gradient-to-b from-[#f8f9fa] to-white dark:from-[#0a0a0a] dark:to-[#161615] px-6 py-16">
                    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-3xl font-semibold mb-4 text-[#1b1b18] dark:text-[#EDEDEC]">
                                ระบบจัดการเอกสารอิเล็กทรอนิกส์
                            </h2>
                            <p className="text-[#706f6c] dark:text-[#A1A09A] mb-6">
                                ระบบจัดการเอกสารอิเล็กทรอนิกส์ ช่วยให้การจัดการเอกสารของโรงเรียนเป็นไปอย่างมีประสิทธิภาพ สะดวก และรวดเร็ว ลดการใช้กระดาษและประหยัดเวลาในการค้นหาเอกสาร
                            </p>
                            <div className="flex gap-4">
                                {auth.user ? (
                                    <Button asChild className="bg-[#1b1b18] text-white hover:bg-black dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white">
                                        <Link href={route('dashboard')}>
                                            เข้าสู่ระบบงาน
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button asChild className="bg-[#1b1b18] text-white hover:bg-black dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white">
                                        <Link href={route('login')}>
                                            เข้าสู่ระบบ
                                        </Link>
                                    </Button>
                                )}
                                {!auth.user && (
                                    <Button asChild variant="outline">
                                        <Link href={route('register')}>
                                            ลงทะเบียน
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <img
                                src="/images/placeholder.svg"
                                alt="ภาพประกอบระบบเอกสาร"
                                className="w-full max-w-md mx-auto"
                            />
                        </div>
                    </div>
                </section>

                {/* ส่วนแสดงเอกสารสาธารณะล่าสุด */}
                <section className="px-6 py-12 bg-white dark:bg-[#161615]">
                    <div className="container mx-auto">
                        <h2 className="text-2xl font-semibold mb-6 text-[#1b1b18] dark:text-[#EDEDEC]">
                            เอกสารสาธารณะ
                        </h2>
                        <p className="text-[#706f6c] dark:text-[#A1A09A] mb-8">
                            เอกสารที่เผยแพร่สู่สาธารณะสามารถเข้าได้โดยไม่ต้องเข้าสู่ระบบ
                        </p>

                        <div className="grid grid-cols-1 gap-6">
                            {publicDocuments && publicDocuments.length > 0 ? (
                                publicDocuments.map((document) => (
                                    <Card key={document.id} className="border border-[#e3e3e0] dark:border-[#3E3E3A]">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <FileText className="h-8 w-8 text-[#706f6c] dark:text-[#A1A09A] mt-1" />
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-lg mb-1 text-[#1b1b18] dark:text-[#EDEDEC]">
                                                        {document.title}
                                                    </h3>
                                                    <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                        <p>ประเภท: {document.documentType?.name || 'ไม่ระบุประเภท'}</p>
                                                        <p>วันที่: {formatThaiDate(document.created_at)}</p>
                                                    </div>
                                                </div>
                                                <Button asChild variant="outline" className="shrink-0">
                                                    <a href={`/storage/${document.file_path}`} target="_blank" download>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        ดาวน์โหลด
                                                    </a>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-12 border border-dashed border-[#e3e3e0] dark:border-[#3E3E3A] rounded-lg">
                                    <p className="text-[#706f6c] dark:text-[#A1A09A]">ไม่พบเอกสารสาธารณะ</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 text-center">
                            <Button asChild variant="outline">
                                <Link href={route('documents.public')} className="flex items-center">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    ดูเอกสารทั้งหมด
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ส่วนท้าย */}
                <footer className="bg-[#FDFDFC] dark:bg-[#0a0a0a] border-t border-[#e3e3e0] dark:border-[#3E3E3A] px-6 py-4">
                    <div className="container mx-auto text-sm text-[#706f6c] dark:text-[#A1A09A] flex flex-col sm:flex-row justify-between items-center gap-2">
                        <p>© {new Date().getFullYear()} ระบบ E-Sarabun โรงเรียน. สงวนลิขสิทธิ์.</p>
                        <div className="flex gap-4">
                            <Link href="/contact" className="hover:underline">ติดต่อเรา</Link>
                            <Link href="/privacy" className="hover:underline">นโยบายความเป็นส่วนตัว</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}