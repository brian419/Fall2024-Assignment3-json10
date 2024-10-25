using FALL2024_Assignment3_json10;
using Fall2024_Assignment3_json10.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace FALL2024_Assignment3_json10.Controllers
{
    public class ActorsController : Controller
    {
        private readonly Fall2024_Assignment3_json10.Data.ApplicationDbContext _context;

        public ActorsController(Fall2024_Assignment3_json10.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Actor actor)
        {
            Console.WriteLine("Create action hit");
            if (ModelState.IsValid)
            {
                Console.WriteLine("Model is valid");
                try
                {
                    _context.Add(actor);
                    await _context.SaveChangesAsync();
                    Console.WriteLine("Actor saved to database");
                    return RedirectToAction(nameof(Index));
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error saving actor: {ex.Message}");
                    ModelState.AddModelError("", "Unable to save actor to the database.");
                }
            }
            else
            {
                Console.WriteLine("Model is invalid");
                foreach (var value in ModelState.Values)
                {
                    foreach (var error in value.Errors)
                    {
                        Console.WriteLine($"Validation error: {error.ErrorMessage}");
                    }
                }
            }
            return View(actor);
        }

        public async Task<IActionResult> Index()
        {
            var actors = await _context.Actors.ToListAsync();
            return View(actors);
        }



        // delete actor
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            Console.WriteLine($"DeleteConfirmed action hit for actor with ID: {id}");

            var actor = await _context.Actors.FindAsync(id);
            if (actor == null)
            {
                Console.WriteLine($"Actor with ID {id} not found.");
                return NotFound();
            }

            try
            {
                _context.Actors.Remove(actor);
                await _context.SaveChangesAsync();
                Console.WriteLine($"Actor with ID {id} deleted successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting actor: {ex.Message}");
                ModelState.AddModelError("", "Unable to delete actor from the database.");
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {
            var actor = await _context.Actors.FindAsync(id);
            if (actor == null)
            {
                return NotFound();
            }
            return View(actor);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Actor actor)
        {
            if (id != actor.Id)
            {
                return BadRequest();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(actor);
                    await _context.SaveChangesAsync();
                    return RedirectToAction(nameof(Index));
                }
                catch (DbUpdateException)
                {
                    ModelState.AddModelError("", "Unable to save changes. Try again, and if the problem persists, see your system administrator.");
                }
            }
            return View(actor);
        }

        [HttpGet]
        public async Task<IActionResult> Details(int id)
        {
            var actor = await _context.Actors.FirstOrDefaultAsync(a => a.Id == id);
            if (actor == null)
            {
                return NotFound();
            }
            return View(actor);
        }
    }
}

