import { makeAutoObservable} from "mobx";
import { authenticateWithGoogle } from "../services/authApi";



export class AuthStore {
  isAuthenticated = false;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    console.log("AuthStore initialized");
  }

  async authenticate() {
    this.loading = true;
    this.error = null;
    try{
      await authenticateWithGoogle();
      this.loading = false;
      //router.push('/auth/success');
      //return true; // Indicate successful authentication
    
    }

    catch (err: unknown) {
    this.error = err instanceof Error ? err.message : 'Authentication failed';
    this.loading = false;
    return false;
  }
    
    
    
  }

  setToken(token: string) {
    localStorage.setItem('access_token', token);
    this.isAuthenticated = true;
    this.error = null;
  }

  setError(error: string) {
    this.error = error;
    this.isAuthenticated = false;
  }
  setAuthenticated(state: boolean) {
    
    this.isAuthenticated = state;
  }

  logout() {
    localStorage.removeItem('access_token');
    this.isAuthenticated = false;
    this.error = null;
  }
}
