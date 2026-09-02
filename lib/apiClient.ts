/**
 * PaintIT Architecture API Client Layer
 * 
 * Domain Separation:
 * - authApi    -> Aspacity Authentication Service (Port 8000 default / NEXT_PUBLIC_AUTH_API_URL)
 * - paintitApi -> PaintIT Product Data Service (Port 5000 default / NEXT_PUBLIC_PAINTIT_API_URL)
 */

export const AUTH_TOKEN_KEY = "paintit_access_token";

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken")
  );
}

export function setStoredAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function removeStoredAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers: customHeaders, ...customOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const token = getStoredAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(customHeaders as Record<string, string>),
    };

    const config: RequestInit = {
      ...customOptions,
      headers,
    };

    const response = await fetch(url, config);

    let data: any;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (typeof data === "object" && (data?.error || data?.message)) ||
        `HTTP Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data as T;
  }

  public get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// 🔐 Aspacity Authentication Service (Auth, Login, Register, Verification, Profile Identity)
export const authApi = new ApiService(
  process.env.NEXT_PUBLIC_AUTH_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000"
);

// 🎨 PaintIT Product Data Service (3D Visualizations, Catalog, Leads, Insights, Portfolio, Reviews)
export const paintitApi = new ApiService(
  process.env.NEXT_PUBLIC_PAINTIT_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:5000"
);
