import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={className}>
            <header className="border-b border-rose-100 dark:border-rose-950/50 pb-4 mb-6">
                <h2 className="text-lg font-extrabold text-rose-700 dark:text-rose-400 flex items-center gap-2 font-heading">
                    <span>⚠️</span> Zone de Danger : Suppression du Compte
                </h2>
                <p className="mt-1 text-xs text-rose-600/80 dark:text-rose-400/80 font-medium">
                    Une fois votre compte supprimé, toutes ses ressources et données seront définitivement effacées.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion} className="rounded-xl px-5 py-2.5 text-xs font-extrabold shadow-md">
                Supprimer le compte
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 space-y-4">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                        Êtes-vous sûr de vouloir supprimer votre compte ?
                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        Cette action est irréversible. Veuillez saisir votre mot de passe pour confirmer la suppression définitive de votre compte.
                    </p>

                    <div className="pt-2">
                        <InputLabel
                            htmlFor="password"
                            value="Mot de passe"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 focus:ring-rose-500"
                            isFocused
                            placeholder="Saisissez votre mot de passe pour confirmer..."
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <SecondaryButton onClick={closeModal} className="rounded-xl">
                            Annuler
                        </SecondaryButton>

                        <DangerButton className="rounded-xl" disabled={processing}>
                            Confirmer la suppression
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
