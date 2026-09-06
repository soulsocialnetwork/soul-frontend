import axios from 'axios';

export function getHttpErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data && typeof data === 'object') {
      const body = data as Record<string, unknown>;
      for (const key of ['message', 'detail', 'error'] as const) {
        const value = body[key];
        if (typeof value === 'string' && value.trim()) {
          return value;
        }
      }
    }

    if (error.response?.status) {
      return `Erro ${error.response.status}`;
    }

    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return 'Não foi possível conectar à API.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível concluir a operação.';
}
