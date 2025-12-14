const toBool = (value: any) => {
    if (!value || ['0', 'no', 'não', 'off', 'false'].includes(value)) {
        return false;
    }

    if (typeof value === 'object') {
        return Object.keys(value).length > 0;
    }

    return true;
};

export default defineEventHandler(async (event) => {
    const body = (await readBody(event)) || {};
    const appConfig = useAppConfig();
    const { waTicket } = appConfig || {};

    let requestURL = getRequestURL(event);
    const debugOn = toBool(appConfig?.debugOn ?? false);

    let acceptMessages = toBool(waTicket?.acceptMessages ?? false);

    if (!acceptMessages) {
        // throw createError({
        return {
            success: false,
            statusCode: 400,
            statusMessage: `Disabled to new messages!`,
        };
    }

    let apiToken = (waTicket?.apiToken || '')?.trim();
    let waTicketApiUrl = (waTicket?.apiUrl || '')?.trim();
    let targetNumber = (waTicket?.targetNumber || '')?.replaceAll(/\D+/g, '');

    if (!apiToken || !waTicketApiUrl || !targetNumber) {
        // throw createError({
        return {
            success: false,
            statusCode: 400,
            statusMessage: `Error on server [CRD]`,
        };
    }

    let messageBody = ``;
    const NL = `\n`;

    let { name, phone, acceptWhatsappMessage, termsAccepted, message, subject } = body;

    name = (name || '')?.trim();
    phone = (phone || '')?.replaceAll(/\D+/g, '');
    acceptWhatsappMessage = toBool(acceptWhatsappMessage ?? false);
    termsAccepted = toBool(termsAccepted ?? false);
    message = message || '';
    subject = subject || '';

    if (!name || !phone) {
        // throw createError({
        return {
            success: false,
            statusCode: 422,
            statusMessage: `Name and phone is required!`,
        };
    }

    messageBody = [
        `*Nome:* ${name}`,
        `*Telefone:* ${phone}`,
        `*Aceita receber WA?:* ` + (acceptWhatsappMessage ? 'sim' : 'não'),
        `*Aceitou os termos?:* ` + (termsAccepted ? 'sim' : 'não'),
        `*Assunto:* ${subject}`,
        `*Mensagem:* ${NL} ${message}${NL}`,
    ]
        .filter((i: any) => Boolean)
        .join(NL);

    let payload = { number: targetNumber, body: messageBody };

    let debugPayload = debugOn
        ? {
              name,
              phone,
              acceptWhatsappMessage,
              termsAccepted,
              message,
              subject,
              payload,
              body,
              waTicket: {
                  ...waTicket,
                  apiToken: (waTicket?.apiToken).slice(0, 2) + '*****' + (waTicket?.apiToken).slice(-2),
              },
          }
        : undefined;

    try {
        const request = await fetch(waTicketApiUrl, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify(payload),
        });

        if (!request.ok) {
            return {
                success: false,
                message: 'Falha ao enviar a mensagem',
                debugPayload,
            };
        }

        return {
            success: true,
            message: 'Mensagem enviada com sucesso',
            debugPayload,
        };
    } catch (error: any) {
        let toReturn: any = {
            success: false,
            message: 'Falha ao enviar a mensagem',
            debugPayload,
            error: null,
        };

        if (debugOn) {
            toReturn.message = error?.message || toReturn.message;
            toReturn.error = error;
            toReturn.requestURL = requestURL;
        }

        return toReturn;
    }
});
