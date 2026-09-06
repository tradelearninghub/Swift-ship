"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { MOCK_COURIER_PARTNERS, MockCourierPartner } from "@/lib/mockData";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Activity,
  Key,
  ShieldCheck,
  Zap,
  Radio,
  Sliders,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function AdminCouriersPage() {
  const [couriers, setCouriers] = useState<MockCourierPartner[]>(MOCK_COURIER_PARTNERS);

  // Test Connection Modal State (§23)
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testingPartner, setTestingPartner] = useState<MockCourierPartner | null>(null);
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<{
    authSuccess: boolean;
    trackingSuccess: boolean;
    shipmentSuccess: boolean;
    responseTimeMs: number;
    logText: string;
  } | null>(null);

  const toggleCapability = (
    courierId: string,
    capability: keyof MockCourierPartner
  ) => {
    setCouriers((prev) =>
      prev.map((c) => {
        if (c.id === courierId) {
          return { ...c, [capability]: !c[capability] };
        }
        return c;
      })
    );
  };

  const handleTestConnection = (courier: MockCourierPartner) => {
    setTestingPartner(courier);
    setTestResult(null);
    setTestModalOpen(true);
    setTestRunning(true);

    setTimeout(() => {
      setTestRunning(false);
      const isHealthy = courier.status === "ACTIVE";
      setTestResult({
        authSuccess: isHealthy,
        trackingSuccess: isHealthy && courier.capability_tracking_api,
        shipmentSuccess: isHealthy && courier.capability_shipment_api,
        responseTimeMs: isHealthy ? Math.floor(180 + Math.random() * 80) : 0,
        logText: isHealthy
          ? `[200 OK] OAuth2 Token Exchange Verified. Endpoints reachable (Latency: 214ms). Rate limits: 500 req/min.`
          : `[503 Unavailable] Partner API Gateway refused credentials. Check encrypted API credentials under settings.`,
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Courier Partners & Adapters</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure multi-carrier API endpoints, granular capability switches (§21), and encrypted credentials.
          </p>
        </div>
      </div>

      {/* Courier Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {couriers.map((courier) => (
          <Card key={courier.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-surface-subtle py-4 flex flex-row items-center justify-between border-b border-border-default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-primary">{courier.name}</h3>
                  <div className="text-[11px] font-mono text-text-muted">
                    Adapter: {courier.code} • Health: {courier.api_health_percent}%
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={courier.status} />
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              {/* Granular Capabilities Switches (§21) */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Granular API Capability Switches (§21)
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "capability_shipment_api", label: "Shipment API" },
                    { key: "capability_tracking_api", label: "Tracking API" },
                    { key: "capability_label_api", label: "Label API" },
                    { key: "capability_pickup_api", label: "Pickup API" },
                    { key: "capability_cancellation_api", label: "Cancellation API" },
                  ].map((cap) => {
                    const isEnabled = courier[cap.key as keyof MockCourierPartner] as boolean;
                    return (
                      <button
                        key={cap.key}
                        onClick={() =>
                          toggleCapability(
                            courier.id,
                            cap.key as keyof MockCourierPartner
                          )
                        }
                        className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                          isEnabled
                            ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                      >
                        <span className="font-medium text-[11px]">{cap.label}</span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            isEnabled ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"
                          }`}
                        >
                          {isEnabled ? "ON" : "OFF"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Metrics & Test Trigger */}
              <div className="pt-3 border-t border-border-default flex items-center justify-between">
                <div className="text-[11px] text-text-secondary">
                  Active Dispatches:{" "}
                  <strong className="text-text-primary">{courier.active_shipments_count}</strong>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection(courier)}
                >
                  <Activity className="w-3.5 h-3.5 mr-1 text-brand-primary" />
                  Test Connection (§23)
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test Connection Modal (§23) */}
      {testingPartner && (
        <Modal
          isOpen={testModalOpen}
          onClose={() => setTestModalOpen(false)}
          title={`API Connection Diagnostic — ${testingPartner.name}`}
          description="Verifies endpoint connectivity, authentication tokens, and tracking responsiveness."
        >
          <div className="space-y-4 text-xs">
            {testRunning ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-semibold text-text-primary">
                  Pinging {testingPartner.name} Gateway & Handshaking OAuth Credentials...
                </p>
              </div>
            ) : testResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-surface-subtle border border-border-default rounded-xl space-y-1">
                    <span className="text-text-muted text-[10px] uppercase font-bold">
                      Authentication
                    </span>
                    <div
                      className={`font-bold flex items-center justify-center gap-1 ${
                        testResult.authSuccess ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {testResult.authSuccess ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {testResult.authSuccess ? "Success" : "Failed"}
                    </div>
                  </div>

                  <div className="p-3 bg-surface-subtle border border-border-default rounded-xl space-y-1">
                    <span className="text-text-muted text-[10px] uppercase font-bold">
                      Tracking API
                    </span>
                    <div
                      className={`font-bold flex items-center justify-center gap-1 ${
                        testResult.trackingSuccess ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {testResult.trackingSuccess ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {testResult.trackingSuccess ? "Reachable" : "Disabled"}
                    </div>
                  </div>

                  <div className="p-3 bg-surface-subtle border border-border-default rounded-xl space-y-1">
                    <span className="text-text-muted text-[10px] uppercase font-bold">
                      Response Latency
                    </span>
                    <div className="font-bold text-text-primary font-mono">
                      {testResult.responseTimeMs > 0 ? `${testResult.responseTimeMs}ms` : "Timeout"}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
                  <div className="text-slate-400 font-bold uppercase text-[9px]">
                    Adapter Gateway Output Log (§22c)
                  </div>
                  <div>{testResult.logText}</div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="sm" onClick={() => setTestModalOpen(false)}>
                    Close Diagnostic
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </Modal>
      )}
    </div>
  );
}
