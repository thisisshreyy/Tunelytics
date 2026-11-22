import type {
  UserProfile,
  Track,
  Artist,
  RecentlyPlayed,
  Playlist,
  PlaylistDetail,
  PlaylistAnalysis,
  TasteAnalysis,
} from '../types';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('tunelytics_token');
  }

  private isDemo(): boolean {
    return !this.getToken();
  }

  private getBaseUrl(): string {
    return this.isDemo() ? '/api/demo' : '/api/spotify';
  }

  private async request<T>(
    path: string,
    params?: Record<string, string>,
    options?: RequestInit,
  ): Promise<T> {
    const url = new URL(path, window.location.origin);
    if (params)
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options?.headers as Record<string, string>) || {}),
    };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url.toString(), {
      ...options,
      headers,
    });
    if (!res.ok) {
      let message = `API error: ${res.status}`;
      try {
        const data = await res.json();
        if (data && data.detail) {
          message = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        }
      } catch {
        // use fallback message
      }
      throw new Error(message);
    }
    return res.json();
  }

  getProfile(): Promise<UserProfile> {
    return this.isDemo()
      ? this.request<UserProfile>('/api/demo/profile')
      : this.request<UserProfile>('/api/auth/me');
  }

  getTopTracks(
    timeRange: string = 'medium_term',
  ): Promise<{ items: Track[] }> {
    return this.request<{ items: Track[] }>(
      `${this.getBaseUrl()}/top-tracks`,
      { time_range: timeRange },
    );
  }

  getTopArtists(
    timeRange: string = 'medium_term',
  ): Promise<{ items: Artist[] }> {
    return this.request<{ items: Artist[] }>(
      `${this.getBaseUrl()}/top-artists`,
      { time_range: timeRange },
    );
  }

  getRecentlyPlayed(): Promise<{ items: RecentlyPlayed[] }> {
    return this.request<{ items: RecentlyPlayed[] }>(
      `${this.getBaseUrl()}/recently-played`,
    );
  }

  getPlaylists(): Promise<{ items: Playlist[] }> {
    return this.request<{ items: Playlist[] }>(
      `${this.getBaseUrl()}/playlists`,
    );
  }

  getPlaylistDetail(id: string): Promise<PlaylistDetail> {
    return this.request<PlaylistDetail>(
      `${this.getBaseUrl()}/playlists/${id}`,
    );
  }

  getPlaylistAnalysis(id: string): Promise<PlaylistAnalysis> {
    return this.request<PlaylistAnalysis>(
      `${this.getBaseUrl()}/playlists/${id}/analysis`,
    );
  }

  getTasteAnalysis(
    timeRange: string = 'medium_term',
  ): Promise<TasteAnalysis> {
    return this.request<TasteAnalysis>(
      `${this.getBaseUrl()}/taste-analysis`,
      { time_range: timeRange },
    );
  }

  getAuthConfig(): Promise<{
    is_configured: boolean;
    client_id_configured: boolean;
    client_id_preview: string | null;
    redirect_uri: string;
  }> {
    return this.request('/api/auth/config');
  }

  saveAuthConfig(payload: {
    client_id: string;
    client_secret: string;
    redirect_uri?: string;
  }): Promise<{ status: string; message: string; is_configured: boolean }> {
    return this.request('/api/auth/config', undefined, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async login(customRedirectUri?: string): Promise<void> {
    const redirectUri = customRedirectUri || `${window.location.origin}/callback`;
    const res = await this.request<{ auth_url: string }>('/api/auth/login', {
      redirect_uri: redirectUri,
    });
    window.location.href = res.auth_url;
  }

  async handleCallback(
    code: string,
    state: string,
  ): Promise<{ token: string; user: UserProfile }> {
    const res = await this.request<{ token: string; user: UserProfile }>(
      `/api/auth/callback?code=${code}&state=${state}`,
    );
    localStorage.setItem('tunelytics_token', res.token);
    return res;
  }

  logout(): void {
    localStorage.removeItem('tunelytics_token');
    window.location.href = '/';
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const api = new ApiService();
