struct User {
    name: String,
    age: u32,
}

impl User {
    fn new(name: String, age: u32) -> User {
        User { name, age }
    }

    fn introduce(&self) {
        println!(
            "Hello, my name is {} and I am {} years old.",
            self.name, self.age
        );
    }
}

fn main() {
    let user = User::new(String::from("Taro"), 30);

    user.introduce();
}
