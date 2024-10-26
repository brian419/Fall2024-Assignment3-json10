using System.Collections.Generic;
using Fall2024_Assignment3_json10.Models;

namespace Fall2024_Assignment3_json10.ViewModels
{
    public class LinkActorsMoviesViewModel
    {
        public required List<Actor> Actors { get; set; }
        public required List<Movie> Movies { get; set; }
    }
}


