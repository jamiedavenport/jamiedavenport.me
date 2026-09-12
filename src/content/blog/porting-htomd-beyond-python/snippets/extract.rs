// HTTP client: cargo add reqwest --features blocking
use htomd::{Options, convert};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = concat!(
        "https://tailwindcss.com/blog/",
        "tailwind-is-joining-shopify"
    );

    let html = reqwest::blocking::get(url)?
        .error_for_status()?
        .text()?;
    let markdown = convert(&html, Options::default());

    print!("{markdown}");
    Ok(())
}
