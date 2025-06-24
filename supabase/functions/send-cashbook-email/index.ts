
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CashBookEmailRequest {
  to: string;
  subject: string;
  message: string;
  emailContent: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, message, emailContent }: CashBookEmailRequest = await req.json();

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: "E-mail e assunto são obrigatórios" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Use a more generic sender that works with custom domains
    const emailResponse = await resend.emails.send({
      from: "noreply@resend.dev", // This should work with custom domains
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            ${subject}
          </h2>
          
          ${message ? `
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #666;">Mensagem:</h3>
              <p style="margin-bottom: 0; line-height: 1.5;">${message.replace(/\n/g, '<br>')}</p>
            </div>
          ` : ''}
          
          <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 20px;">
            <pre style="white-space: pre-line; font-family: monospace; line-height: 1.4; margin: 0;">${emailContent}</pre>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; text-align: center;">
            <p>Este e-mail foi enviado automaticamente pelo sistema de Livro Caixa</p>
            <p>Tesouraria CN Goiânia</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-cashbook-email function:", error);
    
    // Better error handling for domain issues
    let errorMessage = "Erro interno do servidor";
    if (error.message && error.message.includes("domain")) {
      errorMessage = "Erro de configuração de domínio. Verifique se o domínio está verificado no Resend.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
