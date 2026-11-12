export async function processJob(job, api, now = Date.now()) {
  const later = (ms) => new Date(now + ms).toISOString();
  try {
    if (!(await api.ownsToken(job.token, job.user_id))) {
      await api.update(job, { status: "done", last_error: "TOKEN_REMOVED" });
      return;
    }
    if (job.status === "ticket") {
      const body = await api.expo("getReceipts", { ids: [job.ticket_id] });
      const receipt = body.data?.[job.ticket_id];
      if (!receipt) {
        const expired = now - Date.parse(job.created_at) > 24 * 60 * 60 * 1000;
        await api.update(job, {
          status: expired ? "failed" : "ticket",
          available_at: later(15 * 60 * 1000),
          last_error: expired ? "RECEIPT_TIMEOUT" : null,
        });
      } else {
        if (receipt.details?.error === "DeviceNotRegistered")
          await api.removeToken(job.token, job.user_id);
        await api.update(job, {
          status: receipt.status === "ok" ? "done" : "failed",
          last_error:
            receipt.status === "ok"
              ? null
              : (receipt.details?.error ?? "RECEIPT_ERROR"),
        });
      }
      return;
    }
    const body = await api.expo("send", [
      {
        to: job.token,
        title: "P2P Wallet",
        body: "Otrzymano przelew. Sprawdź historię w aplikacji.",
        data: { kind: "wallet" },
        sound: "default",
        channelId: "transfers",
        ttl: 3600,
      },
    ]);
    const ticket = body.data?.[0];
    if (ticket?.status === "ok" && ticket.id) {
      await api.update(job, {
        status: "ticket",
        ticket_id: ticket.id,
        available_at: later(15 * 60 * 1000),
        last_error: null,
      });
    } else {
      if (ticket?.details?.error === "DeviceNotRegistered")
        await api.removeToken(job.token, job.user_id);
      const permanent = [
        "DeviceNotRegistered",
        "MessageTooBig",
        "InvalidCredentials",
      ].includes(ticket?.details?.error);
      await api.update(job, {
        status: permanent || job.attempts >= 6 ? "failed" : "pending",
        available_at: later(60000 * Math.min(32, 2 ** job.attempts)),
        last_error: ticket?.details?.error ?? "PUSH_TICKET_ERROR",
      });
    }
  } catch {
    await api.update(job, {
      status:
        job.status === "pending" && job.attempts >= 6 ? "failed" : job.status,
      available_at: later(5 * 60000),
      last_error: "PUSH_NETWORK_ERROR",
    });
  }
}
