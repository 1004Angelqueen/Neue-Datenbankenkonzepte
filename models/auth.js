// Auth Middleware
  export function authMiddleware(allowedRoles) {
    return async (request, reply) => {
      const authHeader = request.headers.authorization;
  
      if (!authHeader) {
        return reply.code(401).send({ error: "Unauthorized - Kein Auth-Header!" });
      }
  
      const role = authHeader.trim();
  
      if (!allowedRoles.includes(role)) {
        return reply.code(403).send({ error: `Forbidden - Rolle '${role}' hat keine Berechtigung!` });
      }
  
      request.userRole = role;
    };
  }