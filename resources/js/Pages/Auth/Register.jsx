import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { t } = useLanguage();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title={t('register_title')} />

            {/* Header Title */}
            <div className="mb-6 text-center">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
                    {t('register_title')}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {t('register_subtitle')}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value={t('name_label')} />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full text-xs rounded-xl"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Ex: Karim Alami"
                        required
                    />

                    <InputError message={errors.name} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value={t('email_label')} />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full text-xs rounded-xl"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="nom@organisme.ma"
                        required
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
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value={t('confirm_password_label')}
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full text-xs rounded-xl"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        placeholder="••••••••"
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1.5"
                    />
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center btn-zellij py-3 rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20"
                        disabled={processing}
                    >
                        {processing ? t('loading') : t('register_btn')}
                    </PrimaryButton>
                </div>

                {/* Direct Link back to Login Page */}
                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                        {t('already_account')}{' '}
                        <Link
                            href={route('login')}
                            className="font-extrabold text-[#11508f] dark:text-blue-400 hover:underline inline-flex items-center gap-1 ms-1"
                        >
                            <span>{t('login_btn')}</span>
                            <span>→</span>
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
