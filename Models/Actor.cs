namespace Fall2024_Assignment3_json10.Models

{
    public class Actor
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Gender { get; set; } = "";
        public int Age { get; set; }
        public string IMDBLink { get; set; } = "";
        public string Photo { get; set; } = "";

        public ICollection<Movie> Movies { get; set; } = new List<Movie>();
    }
}

