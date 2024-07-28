using EcomApplication.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ECommerceApp.Services
{
    public class UserServiceImpl : IUserService
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly ApplicationDbContext context;
        private readonly RoleManager<IdentityRole> roleManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<UserServiceImpl> _logger;

        public UserServiceImpl(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration, ApplicationDbContext context, ILogger<UserServiceImpl> logger)
        {
            this.userManager = userManager;
            this.roleManager = roleManager;
            _configuration = configuration;
            this.context = context;
            _logger = logger;
        }
        public async Task<(int, string)> Registeration(Registration model, string role)
        {
            var userExists = await userManager.FindByEmailAsync(model.Email);
            if (userExists != null)
                return (0, "User already exists");

            ApplicationUser user = new ApplicationUser()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Username
            };


            var createUserResult = await userManager.CreateAsync(user, model.Password);
            if (!createUserResult.Succeeded)
                return (0, "User creation failed! Please check user details and try again.");

            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
            if (!await roleManager.RoleExistsAsync(UserRoles.User))
                await roleManager.CreateAsync(new IdentityRole(UserRoles.User));

            return (1, "User created successfully!");
        }

        //public async Task<(int, string, string, long, string, string)> Login(Login model)
        //{
        //    var user = await userManager.FindByEmailAsync(model.Email);
        //    var users = await context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);

        //    if (user == null)
        //        return (0, "Invalid username", null, 0, null, null);

        //    if (!await userManager.CheckPasswordAsync(user, model.Password))
        //        return (0, "Invalid password", null, 0, null, null);

        //    var userRoles = await userManager.GetRolesAsync(user);

        //    var authClaims = new List<Claim>
        //{
        //    new Claim(ClaimTypes.Name, user.UserName),
        //    new Claim(ClaimTypes.NameIdentifier, users.UserId.ToString()),
        //    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        //    new Claim(ClaimTypes.Role, users.UserRole)
        //};

        //    foreach (var userRole in userRoles)
        //    {
        //        authClaims.Add(new Claim(ClaimTypes.Role, userRole));
        //    }

        //    string token = GenerateToken(authClaims);

        //    return (1, token, user.Email, users.UserId, users.UserRole, users.Username);
        //}
        public async Task<(int, string, string, long, string, string)> Login(Login model)
        {
            var user = await userManager.FindByEmailAsync(model.Email);
            var users = await context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);

            if (user == null)
                return (0, "Invalid username", null, 0, null, null);

            if (!await userManager.CheckPasswordAsync(user, model.Password))
                return (0, "Invalid password", null, 0, null, null);

            if (users == null)
            {
                _logger.LogError("User details missing from context for email: {Email}", model.Email);
                return (0, "User details missing", null, 0, null, null);
            }

            var userRoles = await userManager.GetRolesAsync(user);

            var authClaims = new List<Claim>
    {
        new Claim(ClaimTypes.Name, user.UserName),
        new Claim(ClaimTypes.NameIdentifier, users.UserId.ToString()),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim(ClaimTypes.Role, users.UserRole ?? "Unknown")
    };

            foreach (var userRole in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, userRole));
            }

            string token = GenerateToken(authClaims);

            return (1, token, user.Email, users.UserId, users.UserRole ?? "Unknown", users.Username ?? "Unknown");
        }



        private string GenerateToken(IEnumerable<Claim> claims)
        {
            if (claims == null) throw new ArgumentNullException(nameof(claims));

            var secretKey = _configuration["JWT:Key"];
            if (string.IsNullOrEmpty(secretKey)) throw new ArgumentNullException("JWT:Key");

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Issuer = _configuration["JWT:Issuer"],
                Audience = _configuration["JWT:Audience"],
                Expires = DateTime.UtcNow.AddHours(3),
                SigningCredentials = new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256),
                Subject = new ClaimsIdentity(claims)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }


        public async Task<User> GetUserByIdAsync(long userId)
        {
            return await context.Users.FindAsync(userId);
        }
    }
}