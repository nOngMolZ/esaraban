import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

// import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'ตั้งค่าข้อมูลส่วนตัว',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    fname: string;
    lname: string;
    email: string;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        fname: auth.user.fname,
        lname: auth.user.lname,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ตั้งค่าข้อมูลส่วนตัว" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="ข้อมูลส่วนตัว" description="แก้ไขชื่อและอีเมลของคุณ" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="fname">ชื่อ</Label>

                            <Input
                                id="fname"
                                className="mt-1 block w-full"
                                value={data.fname}
                                onChange={(e) => setData('fname', e.target.value)}
                                required
                                autoComplete="given-name"
                                placeholder="ชื่อ"
                            />

                            <InputError className="mt-2" message={errors.fname} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="lname">นามสกุล</Label>

                            <Input
                                id="lname"
                                className="mt-1 block w-full"
                                value={data.lname}
                                onChange={(e) => setData('lname', e.target.value)}
                                required
                                autoComplete="family-name"
                                placeholder="นามสกุล"
                            />

                            <InputError className="mt-2" message={errors.lname} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">อีเมล</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="email"
                                placeholder="อีเมล"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    อีเมลของคุณยังไม่ได้ยืนยัน{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        คลิกที่นี่เพื่อส่งอีเมลยืนยันอีกครั้ง
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">ลิงก์ยืนยันใหม่ได้ถูกส่งไปยังอีเมลของคุณแล้ว</div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>บันทึก</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">บันทึกแล้ว</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                {/* 
                    FIXME: ลบบัญชี
                    <DeleteUser /> 
                */}
            </SettingsLayout>
        </AppLayout>
    );
}
