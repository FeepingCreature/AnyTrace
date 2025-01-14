export function getStatusIcon(status: 'success' | 'error' | 'no-match' | 'pending'): string {
  switch (status) {
    case 'success':
      return '<svg class="icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>';
    case 'error':
      return '<svg class="icon" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" /></svg>';
    case 'no-match':
      return '<svg class="icon" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z" /></svg>';
    default:
      return '<svg class="icon" viewBox="0 0 24 24"><circle class="spinner" cx="12" cy="12" r="10"/></svg>';
  }
}
