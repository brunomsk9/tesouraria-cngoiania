
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
  htmlContent: string;
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
    
    // Get and validate API key
    const apiKey = Deno.env.get("RESEND_API_KEY");
    console.log("API key status:", apiKey ? "found" : "not found");
    
    if (!apiKey) {
      console.error("RESEND_API_KEY not found in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "Configuração do servidor incompleta - chave da API não encontrada",
          details: "RESEND_API_KEY não configurada"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Initializing Resend with API key...");
    const resend = new Resend(apiKey);

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      console.log("Request data parsed successfully");
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return new Response(
        JSON.stringify({ error: "Dados da requisição inválidos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { to, subject, message, htmlContent }: CashBookEmailRequest = requestData;
    console.log("Email data:", { 
      to: to ? "provided" : "missing", 
      subject: subject ? subject.substring(0, 30) + "..." : "missing",
      hasMessage: !!message,
      hasHtmlContent: !!htmlContent
    });

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

    console.log("Attempting to send email via Resend...");
    const emailResponse = await resend.emails.send({
      from: "noreply@resend.dev",
      to: [to],
      subject: subject,
      html: htmlContent || `
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
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; text-align: center;">
            <p>Este e-mail foi enviado automaticamente pelo sistema de Livro Caixa</p>
            <p>Tesouraria CN Goiânia</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", { id: emailResponse.id });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "E-mail enviado com sucesso",
      emailId: emailResponse.id 
    }), {
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
      stack: error.stack?.substring(0, 500)
    });
    
    // Better error handling
    let errorMessage = "Erro interno do servidor";
    let statusCode = 500;
    
    if (error.message) {
      if (error.message.includes("API key") || error.message.includes("Invalid API key")) {
        errorMessage = "Erro na configuração da chave da API do Resend. Verifique se a chave está correta.";
        statusCode = 401;
      } else if (error.message.includes("domain")) {
        errorMessage = "Erro de configuração de domínio. Verifique se o domínio está verificado no Resend.";
        statusCode = 403;
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Limite de envio de e-mails atingido. Tente novamente em alguns minutos.";
        statusCode = 429;
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Erro de conectividade. Tente novamente em alguns momentos.";
        statusCode = 503;
      } else {
        errorMessage = `Erro: ${error.message}`;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
