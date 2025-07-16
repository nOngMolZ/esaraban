import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    fname: string;
    lname: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        fname: '',
        lname: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="สร้างบัญชีผู้ใช้" description="กรอกข้อมูลของคุณด้านล่างเพื่อสร้างบัญชีผู้ใช้">
            <Head title="ลงทะเบียน" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="fname">ชื่อ</Label>
                        <Input
                            id="fname"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="given-name"
                            value={data.fname}
                            onChange={(e) => setData('fname', e.target.value)}
                            disabled={processing}
                            placeholder="ชื่อ"
                        />
                        <InputError message={errors.fname} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="lname">นามสกุล</Label>
                        <Input
                            id="lname"
                            type="text"
                            required
                            tabIndex={2}
                            autoComplete="family-name"
                            value={data.lname}
                            onChange={(e) => setData('lname', e.target.value)}
                            disabled={processing}
                            placeholder="นามสกุล"
                        />
                        <InputError message={errors.lname} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">อีเมล</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={3}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">รหัสผ่าน</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="รหัสผ่าน"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">ยืนยันรหัสผ่าน</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={5}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="ยืนยันรหัสผ่าน"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={6} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        สร้างบัญชีผู้ใช้
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    มีบัญชีผู้ใช้แล้ว?{' '}
                    <TextLink href={route('login')} tabIndex={7}>
                        เข้าสู่ระบบ
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
