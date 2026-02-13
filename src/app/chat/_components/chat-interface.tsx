"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatMessage, Message } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ChatUpload } from "./chat-upload";
import { ChatStyleSelector } from "./chat-style-selector";
import { ChatProductSelector } from "./chat-product-selector";
import { ChatSizeSelector } from "./chat-size-selector";
import { ChatProgress } from "./chat-progress";
import { PRICING, formatPrice } from "@/lib/constants";
import {
  maskCPF,
  maskPhone,
  maskCEP,
  validateCPF,
  validateEmail,
  validatePhone,
  validateCEP,
  fetchAddressByCEP,
  type ViaCEPResult,
} from "@/lib/masks";

type ChatStep =
  | "welcome"
  | "photo-upload"
  | "style-selection"
  | "generating"
  | "preview"
  | "product-selection"
  | "size-selection"
  | "customer-name"
  | "customer-email"
  | "customer-cpf"
  | "customer-phone"
  | "customer-password"
  | "shipping-cep"
  | "shipping-details"
  | "shipping-confirm"
  | "payment"
  | "complete";

interface ChatData {
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  style: string;
  generationId: string;
  watermarkedImage: string;
  productId: string;
  size: string;
  customerName: string;
  customerEmail: string;
  customerCPF: string;
  customerPhone: string;
  customerPassword: string;
  shippingCEP: string;
  shippingAddress: ViaCEPResult | null;
  shippingNumber: string;
  shippingComplement: string;
}

let msgCounter = 0;
function nextId() {
  return `msg-${++msgCounter}-${Date.now()}`;
}

export function ChatInterface() {
  const [step, setStep] = useState<ChatStep>("welcome");
  const [messages, setMessages] = useState<Message[]>([]);
  const [data, setData] = useState<ChatData>({
    storagePath: "",
    publicUrl: "",
    mimeType: "",
    style: "",
    generationId: "",
    watermarkedImage: "",
    productId: "",
    size: "",
    customerName: "",
    customerEmail: "",
    customerCPF: "",
    customerPhone: "",
    customerPassword: "",
    shippingCEP: "",
    shippingAddress: null,
    shippingNumber: "",
    shippingComplement: "",
  });
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{ pixId: string; orderId: string } | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isTyping, progress]);

  // Mount + welcome message
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && messages.length === 0) {
      addBotMessage("Oi! Eu sou o Focinho, e vou transformar seu pet em uma obra de arte! Envie uma foto do seu bichinho para comecarmos.").then(() => {
        setStep("photo-upload");
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  const addBotMessage = useCallback(async (content: string, imageUrl?: string, delay = 800): Promise<string> => {
    const typingId = nextId();
    setIsTyping(true);

    // Show typing indicator
    setMessages((prev) => [
      ...prev,
      { id: typingId, type: "bot", content: "", timestamp: new Date(), isTyping: true },
    ]);

    await new Promise((r) => setTimeout(r, delay));

    // Replace typing with real message
    const realId = nextId();
    setMessages((prev) => [
      ...prev.filter((m) => m.id !== typingId),
      { id: realId, type: "bot", content, timestamp: new Date(), imageUrl },
    ]);
    setIsTyping(false);
    return realId;
  }, []);

  const addBotMessageImmediate = useCallback((content: string, extra?: Partial<Message>): string => {
    const id = nextId();
    setMessages((prev) => [
      ...prev,
      { id, type: "bot", content, timestamp: new Date(), ...extra },
    ]);
    return id;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  const addUserMessage = useCallback((content: string, imageUrl?: string) => {
    const id = nextId();
    setMessages((prev) => [
      ...prev,
      { id, type: "user", content, timestamp: new Date(), imageUrl },
    ]);
    return id;
  }, []);

  // ─── STEP HANDLERS ────────────────────────────────

  const handlePhotoUpload = async (file: File) => {
    addUserMessage("", URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao enviar foto");
      }

      setData((prev) => ({
        ...prev,
        storagePath: json.storagePath,
        publicUrl: json.publicUrl,
        mimeType: json.mimeType,
      }));

      await addBotMessage("Que lindo! Agora escolha o estilo do retrato:");
      setStep("style-selection");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar foto";
      await addBotMessage(`Ops! ${msg}. Tente novamente.`);
    }
  };

  const handleStyleSelect = async (styleId: string) => {
    const styleName = { renaissance: "Renascenca", baroque: "Barroco", victorian: "Vitoriano" }[styleId] || styleId;
    addUserMessage(styleName);
    setData((prev) => ({ ...prev, style: styleId }));

    await addBotMessage("Criando o retrato do seu pet... isso leva cerca de 30 segundos.");
    setStep("generating");

    // Start fake progress
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return 95;
        return p + 0.5;
      });
    }, 300);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath: data.storagePath, style: styleId }),
      });
      const json = await res.json();

      if (progressRef.current) clearInterval(progressRef.current);
      setProgress(100);

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao gerar retrato");
      }

      setData((prev) => ({
        ...prev,
        generationId: json.generationId,
        watermarkedImage: json.watermarkedImage,
      }));

      // Small delay to show 100%
      await new Promise((r) => setTimeout(r, 500));
      setProgress(0);

      await addBotMessage("Aqui esta o retrato do seu pet!", json.watermarkedImage);
      await addBotMessage("Agora escolha o formato que deseja:");
      setStep("product-selection");
    } catch (err) {
      if (progressRef.current) clearInterval(progressRef.current);
      setProgress(0);
      const msg = err instanceof Error ? err.message : "Erro ao gerar retrato";
      await addBotMessage(`Ops! ${msg}. Tente enviar outra foto.`);
      setStep("photo-upload");
    }
  };

  const handleProductSelect = async (productId: string) => {
    const product = PRICING.find((p) => p.id === productId);
    if (!product) return;

    addUserMessage(`${product.name} - ${product.price}`);
    setData((prev) => ({ ...prev, productId }));

    if (product.sizes && product.sizes.length > 0) {
      await addBotMessage("Qual tamanho voce prefere?");
      setStep("size-selection");
    } else {
      await addBotMessage("Qual seu nome completo?");
      setStep("customer-name");
    }
  };

  const handleSizeSelect = async (size: string) => {
    addUserMessage(size);
    setData((prev) => ({ ...prev, size }));
    await addBotMessage("Qual seu nome completo?");
    setStep("customer-name");
  };

  const handleCustomerName = async (name: string) => {
    addUserMessage(name);
    setData((prev) => ({ ...prev, customerName: name }));
    const firstName = name.split(" ")[0];
    await addBotMessage(`${firstName}, qual seu e-mail?`);
    setStep("customer-email");
  };

  const handleCustomerEmail = async (email: string) => {
    if (!validateEmail(email)) {
      await addBotMessage("E-mail invalido. Tente novamente:");
      return;
    }
    addUserMessage(email);
    setData((prev) => ({ ...prev, customerEmail: email }));
    await addBotMessage("Agora seu CPF:");
    setStep("customer-cpf");
  };

  const handleCustomerCPF = async (cpf: string) => {
    if (!validateCPF(cpf)) {
      await addBotMessage("CPF invalido. Tente novamente:");
      return;
    }
    addUserMessage(cpf);
    setData((prev) => ({ ...prev, customerCPF: cpf }));
    await addBotMessage("E seu celular?");
    setStep("customer-phone");
  };

  const handleCustomerPhone = async (phone: string) => {
    if (!validatePhone(phone)) {
      await addBotMessage("Numero invalido. Tente novamente (DDD + numero):");
      return;
    }
    addUserMessage(phone);
    setData((prev) => ({ ...prev, customerPhone: phone }));
    await addBotMessage("Crie uma senha para sua conta (minimo 6 caracteres):");
    setStep("customer-password");
  };

  const handleCustomerPassword = async (password: string) => {
    if (password.length < 6) {
      await addBotMessage("A senha precisa ter pelo menos 6 caracteres:");
      return;
    }
    addUserMessage("******");
    setData((prev) => ({ ...prev, customerPassword: password }));

    const isPhysical = data.productId === "print" || data.productId === "canvas";
    if (isPhysical) {
      await addBotMessage("Qual seu CEP?");
      setStep("shipping-cep");
    } else {
      await startPayment({ ...data, customerPassword: password });
    }
  };

  const handleShippingCEP = async (cep: string) => {
    if (!validateCEP(cep)) {
      await addBotMessage("CEP invalido. Tente novamente:");
      return;
    }
    addUserMessage(cep);
    setData((prev) => ({ ...prev, shippingCEP: cep }));

    await addBotMessage("Buscando endereco...", undefined, 400);

    const address = await fetchAddressByCEP(cep);
    if (!address) {
      await addBotMessage("CEP nao encontrado. Tente novamente:");
      return;
    }

    setData((prev) => ({ ...prev, shippingAddress: address }));
    await addBotMessage(
      `Endereco encontrado:\n${address.logradouro}, ${address.bairro}\n${address.localidade} - ${address.uf}`
    );
    await addBotMessage("Qual o numero?");
    setStep("shipping-details");
  };

  const handleShippingNumber = async (number: string) => {
    addUserMessage(number);
    setData((prev) => ({ ...prev, shippingNumber: number }));
    await addBotMessage("Complemento? (digite 'nenhum' se nao tiver)");
    setStep("shipping-confirm");
  };

  const handleShippingComplement = async (complement: string) => {
    const finalComplement = complement.toLowerCase() === "nenhum" ? "" : complement;
    addUserMessage(complement);
    setData((prev) => ({ ...prev, shippingComplement: finalComplement }));

    // Start payment with all data
    await startPayment({
      ...data,
      shippingNumber: data.shippingNumber || "",
      shippingComplement: finalComplement,
    });
  };

  const startPayment = async (currentData: ChatData) => {
    setStep("payment");
    const msgId = addBotMessageImmediate("Gerando pagamento PIX...");

    const product = PRICING.find((p) => p.id === (currentData.productId || data.productId));
    if (!product) return;

    const isPhysical = product.id === "print" || product.id === "canvas";

    try {
      const body: Record<string, unknown> = {
        productType: currentData.productId || data.productId,
        generationId: currentData.generationId || data.generationId,
        size: currentData.size || data.size || undefined,
        customer: {
          name: currentData.customerName || data.customerName,
          email: currentData.customerEmail || data.customerEmail,
          cellphone: (currentData.customerPhone || data.customerPhone).replace(/\D/g, ""),
          taxId: (currentData.customerCPF || data.customerCPF).replace(/\D/g, ""),
        },
        password: currentData.customerPassword || data.customerPassword,
      };

      if (isPhysical && (currentData.shippingAddress || data.shippingAddress)) {
        const addr = currentData.shippingAddress || data.shippingAddress;
        if (addr) {
          body.shippingAddress = {
            street: addr.logradouro,
            number: currentData.shippingNumber || data.shippingNumber,
            complement: currentData.shippingComplement || data.shippingComplement || undefined,
            neighborhood: addr.bairro,
            city: addr.localidade,
            state: addr.uf,
            zip: addr.cep,
          };
        }
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao gerar pagamento");
      }

      // Update message with PIX data
      updateMessage(msgId, {
        content: `Pagamento PIX de ${formatPrice(json.amount)}`,
        pixData: {
          qrCodeImage: json.brCodeBase64,
          brCode: json.brCode,
          amount: json.amount,
          pixId: json.pixId,
          orderId: json.orderId,
        },
      });

      // Store payment info for simulation
      setPaymentInfo({ pixId: json.pixId, orderId: json.orderId });

      // Start polling for payment
      pollingRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `/api/checkout/status?pixId=${json.pixId}&orderId=${json.orderId}`
          );
          const statusJson = await statusRes.json();

          if (statusJson.status === "PAID") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = null;

            const email = currentData.customerEmail || data.customerEmail;
            await addBotMessage(
              `Pagamento confirmado! Seus dados de acesso foram enviados para ${email}. Obrigado por usar o Fotofocinho!`
            );
            setStep("complete");
          } else if (statusJson.status === "EXPIRED" || statusJson.status === "CANCELLED") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = null;
            await addBotMessage("O pagamento expirou. Deseja tentar novamente?");
            setStep("product-selection");
          }
        } catch {
          // Ignore polling errors
        }
      }, 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar pagamento";
      updateMessage(msgId, { content: `Erro: ${msg}` });
      await addBotMessage("Ocorreu um erro. Tente escolher o produto novamente.");
      setStep("product-selection");
    }
  };

  const handleSimulatePayment = async () => {
    if (!paymentInfo) return;
    try {
      const res = await fetch(
        `/api/checkout/status?pixId=${paymentInfo.pixId}&orderId=${paymentInfo.orderId}&simulate=true`
      );
      const json = await res.json();
      if (json.status === "PAID") {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;
        setPaymentInfo(null);
        const email = data.customerEmail;
        await addBotMessage(
          `Pagamento confirmado! Seus dados de acesso foram enviados para ${email}. Obrigado por usar o Fotofocinho!`
        );
        setStep("complete");
      }
    } catch {
      await addBotMessage("Erro ao simular pagamento. Tente novamente.");
    }
  };

  const handleReset = () => {
    setMessages([]);
    setData({
      storagePath: "",
      publicUrl: "",
      mimeType: "",
      style: "",
      generationId: "",
      watermarkedImage: "",
      productId: "",
      size: "",
      customerName: "",
      customerEmail: "",
      customerCPF: "",
      customerPhone: "",
      customerPassword: "",
      shippingCEP: "",
      shippingAddress: null,
      shippingNumber: "",
      shippingComplement: "",
    });
    setPaymentInfo(null);
    setStep("welcome");
    msgCounter = 0;
    // Re-trigger welcome
    setTimeout(() => {
      addBotMessage("Oi! Eu sou o Focinho, e vou transformar seu pet em uma obra de arte! Envie uma foto do seu bichinho para comecarmos.").then(() => {
        setStep("photo-upload");
      });
    }, 100);
  };

  // ─── RENDER ────────────────────────────────────────

  if (!mounted) {
    return (
      <div className="chat-container" style={{ justifyContent: "center", alignItems: "center" }}>
        <div className="typing-indicator" style={{ background: "none" }}>
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    );
  }

  const selectedProduct = PRICING.find((p) => p.id === data.productId);

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-avatar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M4.5 9.5C4.5 5.36 7.86 2 12 2s7.5 3.36 7.5 7.5c0 2.9-1.64 5.41-4.04 6.67L14 17.5V19a2 2 0 01-2 2h0a2 2 0 01-2-2v-1.5l-1.46-1.33C6.14 14.91 4.5 12.4 4.5 9.5zM9 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm6 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-5 3.5c0 1.1 1.34 2 3 2s3-.9 3-2" />
          </svg>
        </div>
        <div className="chat-header-info" style={{ flex: 1 }}>
          <h1>Focinho</h1>
          <p>Pet Portrait Assistant</p>
        </div>
        <a
          href="/minha-conta"
          className="chat-header-menu-btn"
          title="Minha Conta"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </a>
      </div>

      {/* Messages */}
      <div className="chat-messages" ref={messagesRef}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Inline interactive components */}
        {!isTyping && step === "photo-upload" && (
          <ChatUpload onUpload={handlePhotoUpload} />
        )}

        {!isTyping && step === "style-selection" && (
          <ChatStyleSelector onSelect={handleStyleSelect} />
        )}

        {!isTyping && step === "generating" && progress > 0 && (
          <div className="msg-bot">
            <ChatProgress progress={progress} />
          </div>
        )}

        {!isTyping && step === "product-selection" && (
          <ChatProductSelector onSelect={handleProductSelect} />
        )}

        {!isTyping && step === "size-selection" && selectedProduct?.sizes && (
          <ChatSizeSelector sizes={selectedProduct.sizes} onSelect={handleSizeSelect} />
        )}

        {!isTyping && step === "payment" && paymentInfo && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <button
              className="confirm-btn"
              onClick={handleSimulatePayment}
              style={{ background: "var(--sage)" }}
            >
              Simular Pagamento (Dev)
            </button>
          </div>
        )}

        {!isTyping && step === "complete" && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <button className="confirm-btn" onClick={handleReset}>
              Criar outro retrato
            </button>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        {step === "customer-name" && !isTyping && (
          <ChatInput
            placeholder="Seu nome completo..."
            onSubmit={handleCustomerName}
          />
        )}
        {step === "customer-email" && !isTyping && (
          <ChatInput
            placeholder="seu@email.com"
            onSubmit={handleCustomerEmail}
            type="email"
          />
        )}
        {step === "customer-cpf" && !isTyping && (
          <ChatInput
            placeholder="000.000.000-00"
            onSubmit={handleCustomerCPF}
            mask={maskCPF}
          />
        )}
        {step === "customer-phone" && !isTyping && (
          <ChatInput
            placeholder="(00) 00000-0000"
            onSubmit={handleCustomerPhone}
            mask={maskPhone}
          />
        )}
        {step === "customer-password" && !isTyping && (
          <ChatInput
            placeholder="Minimo 6 caracteres"
            onSubmit={handleCustomerPassword}
            type="password"
          />
        )}
        {step === "shipping-cep" && !isTyping && (
          <ChatInput
            placeholder="00000-000"
            onSubmit={handleShippingCEP}
            mask={maskCEP}
          />
        )}
        {step === "shipping-details" && !isTyping && (
          <ChatInput
            placeholder="Numero"
            onSubmit={handleShippingNumber}
          />
        )}
        {step === "shipping-confirm" && !isTyping && (
          <ChatInput
            placeholder="Complemento (ou 'nenhum')"
            onSubmit={handleShippingComplement}
          />
        )}
        {(step === "generating" || step === "payment" || step === "welcome") && (
          <div style={{ textAlign: "center", fontSize: 12, color: "var(--earth-light)", padding: 8 }}>
            {step === "payment" ? "Aguardando pagamento..." : step === "generating" ? "Gerando retrato..." : ""}
          </div>
        )}
      </div>
    </div>
  );
}
