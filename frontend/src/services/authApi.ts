import { graphQLApi } from "./graphQlBaseApi";
import { User} from "../stores/userStore";

interface TokenValidationResponse {
  isValid: boolean;
  message: string;
  newToken?: string;
  user?: User;
}

export function authenticateWithGoogle() {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    // For OAuth flows, we need to redirect the entire page, not use fetch
    window.location.href = `${baseUrl}/authentication/google`;
}

export async function validateToken(): Promise<TokenValidationResponse> {
    const query = `
        query ValidateToken {
            validateToken {
                isValid
                message
                newToken
                user {
                    id
                    googleId
                    name
                    email
                    avatar
                    role
                }
            }
        }
    `;

    try {
        const response = await graphQLApi.query<{ validateToken: TokenValidationResponse }>(query);
        return response.validateToken;
    } catch (error) {
        console.error('Token validation failed:', error);
        return {
            isValid: false,
            message: error instanceof Error ? error.message : 'Token validation failed',
        };
    }
}