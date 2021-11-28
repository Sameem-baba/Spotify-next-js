import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import SpotifyApi, { LOGIN_URL } from "../../../lib/spotify";

async function refreshAcessToken(token) {
    try {

        SpotifyApi.setAccessToken(token.accessToken);
        SpotifyApi.setRefreshToken(token.refreshToken);

        const { body: refreshedToken } = await SpotifyApi.refreshAccessToken();

        return {
            ...token,
            accessToken: refreshedToken.access_token,
            accessTokenExpires: Date.now() + refreshedToken.expires_in * 1000,
            refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
        }

    } catch (err) {
        console.error(err);

        return {
            ...token,
            error: 'RefreshAcessTokenError'
        }
    }
}

export default NextAuth({
    // Configure one or more authentication providers
    providers: [
        SpotifyProvider({
            clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
            clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
            authorization: LOGIN_URL,
        }),
        // ...add more providers here
    ],
    
    secret: process.env.JWT_SECRET,

    pages: {
        signIn: '/login',
    },

    callbacks: {
        async jwt({ token, account, user }) {
            
            //initial sign initial
            if (account && user) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    username: account.username,
                }
            }

            if (Date.now() < token.accessTokenExpires) {
                console.log("Token is Valid")
                return token;
            }

            //Acess token expires, need to refresh it...
            console.log("Token is expired, ")
            return await refreshAcessToken(token)
        },

        async session({ session, token }) {
            session.user.accessToken = token.accessToken;
            session.user.refreshToken = token.refreshToken;
            session.user.username = token.username;

            return session;
        },
    },
});