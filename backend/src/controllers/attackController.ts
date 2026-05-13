import { Response } from 'express';
import { encode as escape } from 'html-entities';
import { AuthRequest } from '../middleware/auth';

// POST /api/attack/sqli-demo
export const sqliDemo = (req: AuthRequest, res: Response): void => {
  const { input, mode } = req.body as { input: string; mode: 'vulnerable' | 'secure' };

  if (mode === 'vulnerable') {
    // Simulate what would happen in insecure code (no real DB query)
    const fakeQuery = `db.users.find({ username: '${input}' })`;
    const isAttack = input.includes('$') || input.includes('{') || input.includes(';');
    res.json({
      query: fakeQuery,
      result: isAttack
        ? '⚠️ ATTACK DETECTED — In a real vulnerable app, this could drop your database or leak all records!'
        : `Found 1 user matching username: ${input}`,
      blocked: false,
      explanation: 'Raw string concatenation into query. User input is executed as query logic.',
    });
  } else {
    // Secure mode: sanitized — operators stripped
    const sanitized = String(input).replace(/[${}]/g, '');
    const fakeQuery = `User.findOne({ username: sanitized }) // sanitized: "${sanitized}"`;
    res.json({
      query: fakeQuery,
      result: sanitized
        ? `Safe lookup for username: "${sanitized}"`
        : 'Empty input — no query executed',
      blocked: true,
      explanation:
        'Mongoose ORM uses parameterized queries. express-mongo-sanitize strips $ and . operators. Input is treated as literal string only.',
    });
  }
};

// POST /api/attack/xss-demo
export const xssDemo = (req: AuthRequest, res: Response): void => {
  const { input, mode } = req.body as { input: string; mode: 'vulnerable' | 'secure' };

  const isAttack = /<script|onerror|javascript:|on\w+=/i.test(input);

  if (mode === 'vulnerable') {
    res.json({
      rendered:    input, // raw, unescaped
      blocked:     false,
      isAttack,
      explanation: 'Output inserted directly into DOM via innerHTML. Script tags execute in victim\'s browser.',
    });
  } else {
    const safe = escape(input);
    res.json({
      rendered:    safe,
      blocked:     isAttack,
      isAttack,
      explanation:
        'html-entities escapes < > & " \' into HTML entities. React JSX auto-escapes output. CSP header blocks external scripts.',
    });
  }
};

// POST /api/attack/csrf-demo
export const csrfDemo = (req: AuthRequest, res: Response): void => {
  const { origin } = req.body as { origin: string };
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

  const isCrossOrigin = origin && origin !== allowedOrigin;

  if (isCrossOrigin) {
    res.status(403).json({
      blocked:     true,
      reason:      'SameSite=Strict cookie was NOT sent with cross-origin request',
      explanation: `Request from "${origin}" was blocked. JWT cookie has SameSite=Strict — browser refuses to attach it on cross-site requests. Even if the attacker's page issues a fetch(), no credentials are sent.`,
    });
  } else {
    res.json({
      blocked:     false,
      reason:      'Same-origin request — cookie attached normally',
      explanation: 'This is a legitimate request from the same origin. Cookie is sent and request succeeds.',
    });
  }
};

// POST /api/attack/upload-demo
export const uploadDemo = (_req: AuthRequest, res: Response): void => {
  const { filename, mimetype } = _req.body as { filename: string; mimetype: string };

  const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const BLOCKED_EXTENSIONS = ['.php', '.exe', '.sh', '.py', '.js', '.bat', '.cmd'];
  const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')).toLowerCase() : '';

  const mimeBlocked = !ALLOWED.includes(mimetype);
  const extBlocked  = BLOCKED_EXTENSIONS.includes(ext);
  const traversal   = filename.includes('..') || filename.includes('/') || filename.includes('\\');

  const blocked = mimeBlocked || extBlocked || traversal;

  res.json({
    blocked,
    checks: {
      mimeType:           { value: mimetype,  blocked: mimeBlocked,  reason: mimeBlocked ? 'MIME not in allowlist' : 'OK' },
      extension:          { value: ext,        blocked: extBlocked,   reason: extBlocked  ? 'Dangerous extension' : 'OK'  },
      directoryTraversal: { value: filename,   blocked: traversal,    reason: traversal   ? '../ detected in filename' : 'OK' },
      storedAs:           { value: blocked ? 'REJECTED' : 'a3f91c7d-uuid.ext', blocked: false, reason: 'UUID rename eliminates original filename' },
    },
    explanation: blocked
      ? 'File REJECTED. Real upload would throw 400 error. No file written to disk.'
      : 'File accepted. Stored with UUID name outside web root. Cannot be accessed directly via URL.',
  });
};
