import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";

export default function Login({ status, canResetPassword }) {
    const { company_name } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        phone: "",
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title={`Log in - ${company_name}`} />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            {/* Show custom permission or other general errors here */}
            {errors.permission && (
                <div className="mb-4 text-sm font-medium text-red-600">
                    {errors.permission}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="relative">
                    <InputLabel htmlFor="phone" value="Phone" />

                    <input
                        id="phone"
                        type="text"
                        name="phone"
                        value={data.phone}
                        className="mt-1 block w-full pr-12"
                        autoComplete={false}
                        autoFocus
                        maxLength={11} // limit input
                        onChange={(e) => setData("phone", e.target.value)}
                    />

                    {/* Character counter positioned to the right */}
                    <span className="absolute top-[69%] right-3 transform -translate-y-1/2 text-sm text-muted-foreground">
                        {data.phone.length}/11
                    </span>

                    <InputError message={errors.phone} className="mt-2" />
                </div>

                {/* <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full custom-input"
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData("email", e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div> */}

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData("password", e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Uncomment this block if you want a remember me checkbox */}
                {/* <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData("remember", e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-gray-600">Remember me</span>
                    </label>
                </div> */}

                <div className="mt-4 flex items-center justify-end">
                    {/* Uncomment if you want a forgot password link */}
                    {/* {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )} */}

                    <button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition"
                        disabled={processing}
                    >
                        Log in
                    </button>
                    {/* <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                        disabled={processing}
                    >
                        Log in
                    </button> */}
                </div>
            </form>
        </GuestLayout>
    );
}
