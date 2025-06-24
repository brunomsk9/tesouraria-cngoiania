
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
  console.log("Function called with method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing email request...");
    
    // Check if RESEND_API_KEY is available
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY not found in environment variables");
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta - chave da API não encontrada" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("API key found, initializing Resend...");
    const resend = new Resend(apiKey);

    const { to, subject, message, emailContent }: CashBookEmailRequest = await req.json();
    console.log("Request data parsed:", { to, subject: subject?.substring(0, 50) });

    if (!to || !subject) {
      console.error("Missing required fields:", { to: !!to, subject: !!subject });
      return new Response(
        JSON.stringify({ error: "E-mail e assunto são obrigatórios" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending email via Resend...");
    const emailResponse = await resend.emails.send({
      from: "noreply@resend.dev",
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
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Better error handling
    let errorMessage = "Erro interno do servidor";
    if (error.message) {
      if (error.message.includes("API key")) {
        errorMessage = "Erro na configuração da chave da API do Resend";
      } else if (error.message.includes("domain")) {
        errorMessage = "Erro de configuração de domínio. Verifique se o domínio está verificado no Resend.";
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Limite de envio de e-mails atingido. Tente novamente em alguns minutos.";
      } else {
        errorMessage = `Erro: ${error.message}`;
      }
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
