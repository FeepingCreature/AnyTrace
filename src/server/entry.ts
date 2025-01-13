console.log('🚨 ENTRY.TS IS DEFINITELY RUNNING 🚨');

export const onRequest = () => {
    console.log('🚨 REQUEST RECEIVED IN ENTRY.TS 🚨');
    return new Response('Test from entry.ts');
};
