import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useLanguage } from '@/Context/LanguageContext';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const { t } = useLanguage();

    const [avatarPreview, setAvatarPreview] = useState(
        user.avatar ? `/storage/${user.avatar}` : null
    );

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            _method: 'PATCH',
            name: user.name || '',
            email: user.email || '',
            fonction: user.fonction || '',
            telephone: user.telephone || '',
            bio: user.bio || '',
            avatar: null,
        });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        // Use post with _method PATCH for multipart file uploads in Inertia
        post(route('profile.update'), {
            forceFormData: true,
        });
    };

    return (
        <section className={className}>
            <header className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-heading">
                    <span>📝</span> Informations du Profil & Identité
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Personnalisez votre photo de profil, fonction, téléphone et biographie professionnelle.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-6">
                
                {/* Profile Picture (PFP) Upload */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                    <div className="relative shrink-0">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt={user.name}
                                className="h-20 w-20 rounded-2xl object-cover shadow-md border-2 border-[#11508f]"
                            />
                        ) : (
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#11508f] to-[#1d6fc2] text-white flex items-center justify-center text-2xl font-black shadow-md border-2 border-white/20 font-heading">
                                {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 text-center sm:text-left flex-1">
                        <InputLabel value="Photo de Profil (PFP)" className="font-bold text-xs text-slate-800 dark:text-slate-200" />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Formats acceptés : PNG, JPG, JPEG (Max : 2 Mo).
                        </p>
                        <input
                            type="file"
                            id="avatar"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-blue-50 dark:file:bg-blue-950 file:text-[#11508f] dark:file:text-blue-300 hover:file:bg-blue-100 cursor-pointer"
                        />
                        <InputError className="mt-1" message={errors.avatar} />
                    </div>
                </div>

                {/* Name & Email Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="name" value="Nom Complet *" className="font-bold text-xs text-slate-700 dark:text-slate-300" />
                        <TextInput
                            id="name"
                            className="mt-1.5 block w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 focus:ring-[#11508f]"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Adresse Email *" className="font-bold text-xs text-slate-700 dark:text-slate-300" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1.5 block w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 focus:ring-[#11508f]"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>
                </div>

                {/* Job Title & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="fonction" value="Fonction / Poste" className="font-bold text-xs text-slate-700 dark:text-slate-300" />
                        <TextInput
                            id="fonction"
                            placeholder="ex: Responsable SI, Administrateur System..."
                            className="mt-1.5 block w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 focus:ring-[#11508f]"
                            value={data.fonction}
                            onChange={(e) => setData('fonction', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.fonction} />
                    </div>

                    <div>
                        <InputLabel htmlFor="telephone" value="Téléphone / Extension" className="font-bold text-xs text-slate-700 dark:text-slate-300" />
                        <TextInput
                            id="telephone"
                            placeholder="ex: +212 522 123 456 / Poste 402"
                            className="mt-1.5 block w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 focus:ring-[#11508f]"
                            value={data.telephone}
                            onChange={(e) => setData('telephone', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.telephone} />
                    </div>
                </div>

                {/* Professional Bio */}
                <div>
                    <InputLabel htmlFor="bio" value="Biographie / Description Professionnelle" className="font-bold text-xs text-slate-700 dark:text-slate-300" />
                    <textarea
                        id="bio"
                        rows="3"
                        placeholder="Présentez vos responsabilités principales au sein du parc informatique..."
                        className="mt-1.5 block w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-[#11508f] p-3 shadow-inner"
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                    ></textarea>
                    <InputError className="mt-2" message={errors.bio} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50">
                        <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                            Votre adresse email n'est pas encore vérifiée.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ms-2 underline font-bold text-amber-900 dark:text-amber-200 hover:text-amber-700"
                            >
                                Renvoyer le lien de vérification.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                Un nouveau lien de vérification a été envoyé à votre adresse email.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton disabled={processing} className="btn-zellij">
                        Enregistrer les modifications
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span>✓</span> Profil mis à jour avec succès.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
