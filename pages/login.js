import { getProviders, signIn } from 'next-auth/react';
import Head from 'next/head';

function Login({ providers }) {
    return (
        <div className="flex flex-col items-center bg-black min-h-screen w-full justify-center">
            <Head>
                <title>Spotify 2.0</title>
                <link rel="icon" href="https://headabovemusic.com/wp-content/uploads/2017/08/Spotify-icon.png" />
            </Head>
            <img
                className="w-52 mb-5"
                src="https://links.papareact.com/9xl"
                alt=""
            />

            {Object.values(providers).map((provider) => (
                <div key={provider.name} className="">
                    <button onClick={() => signIn(provider.id, {callbackUrl: '/'})} className="bg-[#18D860] text-white p-5 rounded-lg">
                        Login with {provider.name}
                    </button>
                </div>
            ))}
        </div>
    )
}

export default Login;

export async function getServerSideProps() {
    const providers = await getProviders();

    return {
        props: {
            providers
        }
    }
}
