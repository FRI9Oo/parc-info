import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { t } = useLanguage();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title={t('login_title')} />

            {/* Header Title */}
            <div className="mb-6 text-center">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
                    {t('login_title')}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {t('login_subtitle')}
                </p>
            </div>

            {status && (
                <div className="mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value={t('email_label')} />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full text-xs rounded-xl"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="nom@organisme.ma"
                    />

                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value={t('password_label')} />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full text-xs rounded-xl"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />

                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-xs font-medium text-slate-600 dark:text-slate-400 select-none">
                            {t('remember_me')}
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs font-bold text-[#11508f] dark:text-blue-400 hover:underline"
                        >
                            {t('forgot_password')}
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center btn-zellij py-3 rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20"
                        disabled={processing}
                    >
                        {processing ? t('loading') : t('login_btn')}
                    </PrimaryButton>
                </div>

                {/* Direct Link to Register Page */}
                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        {t('no_account')}{' '}
                        <Link
                            href={route('register')}
                            className="font-extrabold text-[#11508f] dark:text-blue-400 hover:underline inline-flex items-center gap-1 ms-1"
                        >
                            <span>{t('create_account')}</span>
                            <span>→</span>
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
