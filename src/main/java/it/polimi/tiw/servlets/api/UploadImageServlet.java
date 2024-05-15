package it.polimi.tiw.servlets.api;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import org.thymeleaf.context.WebContext;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import it.polimi.tiw.beans.Album;
import it.polimi.tiw.beans.Image;
import it.polimi.tiw.beans.Person;
import it.polimi.tiw.dao.AlbumDAO;
import it.polimi.tiw.dao.ImageDAO;
import it.polimi.tiw.servlets.DataServlet;
import it.polimi.tiw.utils.CreateAlbumUtility;
import it.polimi.tiw.utils.JsonUtility;

@WebServlet("/uploadImage")
@MultipartConfig(fileSizeThreshold = 1024 * 1024 * 1, // 1 MB
maxFileSize = 1024 * 1024 * 10, // 10 MB
maxRequestSize = 1024 * 1024 * 100 // 100MB
)
public class UploadImageServlet extends ApiServlet {
    private static final long serialVersionUID = -7297515526260117146L;
    
	public UploadImageServlet() {
        super();
    }
	
	public void init() throws ServletException {
		super.init();
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		setJsonContent(response);
		Person user = (Person) request.getSession().getAttribute("user");
		ServletContext context = request.getServletContext();
		
		// The user is trying to upload an image
		String title = request.getParameter("title");
		String description = request.getParameter("description");
		if (title == null || title.isEmpty() || title.length() > 30) {
			this.badRequestResponse(response, "Wrong title given, the title must be at least one character and maximum 30 characters");
			return;
		}
		if (description == null || description.isEmpty() || description.length() > 4096) {
			this.badRequestResponse(response, "Wrong description given, the description must be at least one character and maximum 4096 characters");
			return;	
		}

		// Receive the file
		Part imagePart = request.getPart("image");
		System.out.println(imagePart.getSubmittedFileName());
		if (imagePart.getContentType() != null && !imagePart.getContentType().split("/")[0].equals("image")) {
			this.badRequestResponse(response, "The file given was not an image");
			return;
		}
		InputStream imageContent = imagePart.getInputStream();
		String submitted = imagePart.getSubmittedFileName();
		String extension;
		if (submitted != null) {
			extension = submitted.substring(submitted.lastIndexOf("."));
		} else {
			extension = ".png";
		}
		String image_path = CreateAlbumUtility.getRandomFilePath(context.getInitParameter("uploadDir"), extension);
		String full_path = context.getInitParameter("uploadDir") + image_path;

		try {
			// Try saving the file
			Files.copy(imageContent, new File(full_path).toPath());
		} catch (Exception e) {
			e.printStackTrace();
			this.badRequestResponse(response, "Error saving the file", 500);
			return;
		}
		// Try saving the image in the database
		try {
			ImageDAO imageDAO = new ImageDAO(this.dbConnection);
			Optional<Image> img = imageDAO.save(image_path, title, description, String.valueOf(user.getId()));
			this.goodRequestResponse(response, JsonUtility.mapToJson(img.get()));
		} catch (SQLException e) {
			this.badRequestResponse(response, "Error connecting to the database");
			return;
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doGet(request, response);
	}
}
