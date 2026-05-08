

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message?: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
}

export class GraphQLBaseApi {
  private baseURL: string;
  private lastRequestBody = "";

  constructor(baseURL: string = process.env.NEXT_PUBLIC_BACKEND_GRAPHQL_URL!) {
    this.baseURL = baseURL;
  }

  private handleAuthFailure(message: string): never {
    // remove token from local storage
    localStorage.removeItem('access_token');
    window.location.href = "/auth";
    throw new Error(message);
  }

  private shouldTriggerAuthFailure(query: string, data: any): boolean {
    const authSensitiveQueries = [
      { name: "getCurrentUser", field: "getCurrentUser" },
      { name: "createOneTimePaymentIntent", field: "createOneTimePaymentIntent" },
      { name: "createSubscription", field: "createSubscription" },
    ];

    return authSensitiveQueries.some(
      ({ name, field }) => query.includes(name) && data?.[field] === null
    );
  }

  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const token = localStorage.getItem('access_token');
    return {
      "Content-Type": "application/json",
      ...customHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(
    response: Response,
    originalQuery: string
  ): Promise<GraphQLResponse<T>> {
    // Parse the response regardless of status
    let result: GraphQLResponse<T>;
    
    try {
      result = await response.json();
    } catch (parseError) {
      // If we can't parse JSON, return error structure for stores to handle
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      return {
        errors: [{ message: `Failed to parse response: ${errorMessage}` }]
      };
    }

    // Check for auth failures that require redirect
    
    // Auth check based on null data
    if (result.data && this.shouldTriggerAuthFailure(originalQuery, result.data)) {
      this.handleAuthFailure("Authentication failed - redirecting to login");
    }

    // Check for auth errors in GraphQL errors
    if (result.errors?.length) {
      const firstError = result.errors[0];
      if (firstError?.message) {
        const errorMsg = firstError.message.toLowerCase();
        const isAuthError =
          ["unauthorized", "invalid token", "expired", "jwt"].some((e) =>
            errorMsg.includes(e)
          );

        // Only handle auth errors in base API - redirect to login
        if (isAuthError) {
          this.handleAuthFailure("Authentication failed - redirecting to login");
        }
      }
    }

    // Check for HTTP 401 status
    if (response.status === 401) {
      this.handleAuthFailure("Authentication failed - redirecting to login");
    }

    // Return the result as-is - let stores handle all other errors
    return result;
  }

  async query<T = any>(
    query: string,
    variables?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    this.lastRequestBody = JSON.stringify({ query, variables });

    let response: Response;
    
    try {
      response = await fetch(this.baseURL, {
        method: "POST",
        headers: this.buildHeaders(headers),
        body: this.lastRequestBody,
      });
    } catch (networkError) {
      // Network errors should be handled by stores
      throw new Error(`Network error: ${networkError instanceof Error ? networkError.message : 'Unknown network error'}`);
    }

    const result = await this.handleResponse<T>(response, query);
    
    // If there are GraphQL errors, throw them for stores to catch
    if (result.errors?.length) {
      const firstError = result.errors[0];
      const errorMessage = firstError?.message || 'Unknown GraphQL error';
      throw new Error(errorMessage);
    }
    
    // If no data, throw error for stores to catch
    if (!result.data) {
      throw new Error("Failed to fetch");
    }
    
    return result.data;
  }

  async mutation<T = any>(
    mutation: string,
    variables?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.query<T>(mutation, variables, headers);
  }
}

export const graphQLApi = new GraphQLBaseApi();
