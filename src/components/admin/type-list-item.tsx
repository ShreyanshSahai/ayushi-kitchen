"use client";

import { useState, useTransition } from "react";
import { FoodType } from "@prisma/client";
import { deleteType, updateType } from "@/app/admin/types/actions";

type Props = {
    type: FoodType;
};

export function TypeListItem({ type }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${type.name}"?`)) {
            startTransition(() => {
                void deleteType(type.id);
            });
        }
    };

    const handleEditSubmit = (formData: FormData) => {
        startTransition(() => {
            void updateType(type.id, formData).then(() => {
                setIsEditing(false);
            });
        });
    };

    return (
        <li className="flex items-center justify-between rounded-md bg-slate-700/50 px-3 py-2">
            {isEditing ? (
                <form action={handleEditSubmit} className="flex-grow">
                    <input
                        type="text"
                        name="name"
                        defaultValue={type.name}
                        className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-3 py-1 text-base text-slate-200 placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                        autoFocus
                    />
                </form>
            ) : (
                <span className="text-base text-slate-300">{type.name}</span>
            )}
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
                        disabled={isPending}
                    >
                        Cancel
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
                            disabled={isPending}
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                            disabled={isPending}
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>
        </li>
    );
}
