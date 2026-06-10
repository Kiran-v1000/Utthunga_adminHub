import { Router } from 'express';
import { validateHmac } from './webhook.validator';
import { prisma } from '@/config/db';

const router = Router();

function requireHmac(req: Parameters<typeof validateHmac>[0], res: { status: (n: number) => { json: (o: unknown) => void } }, next: () => void) {
  if (!validateHmac(req, process.env.ERP_WEBHOOK_SECRET!)) {
    return res.status(401).json({ success: false, error: 'Invalid HMAC signature' });
  }
  next();
}

// POST /integrations/erp/asset-sync
router.post('/asset-sync', requireHmac as never, async (req, res) => {
  const { assetId, costCenter, glCode, currentValue, depreciationMethod } = req.body;

  const asset = await prisma.asset.findFirst({ where: { assetId } });
  if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });

  const updated = await prisma.asset.update({
    where: { id: asset.id },
    data: {
      costCenter: costCenter ?? asset.costCenter,
      glCode: glCode ?? asset.glCode,
      currentValue: currentValue ?? asset.currentValue,
      depreciationMethod: depreciationMethod ?? asset.depreciationMethod,
    },
  });

  res.json({ success: true, data: updated });
});

// POST /integrations/erp/po-created
router.post('/po-created', requireHmac as never, async (req, res) => {
  const { poNumber, requestNumber, status } = req.body;

  const pr = await prisma.purchaseRequest.findFirst({ where: { requestNumber } });
  if (!pr) return res.status(404).json({ success: false, error: 'Purchase request not found' });

  const updated = await prisma.purchaseRequest.update({
    where: { id: pr.id },
    data: { status: status ?? 'APPROVED' },
  });

  res.json({ success: true, data: updated });
});

export default router;
