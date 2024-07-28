using EcomApplication.Models;

namespace ECommerceApp.Services
{
    public interface IUserService
    {
        Task<(int, string)> Registeration(Registration model, string role);
        Task<(int, string, string, long, string, string)> Login(Login model);
        Task<User> GetUserByIdAsync(long userId);


    }
}