package it.polimi.tiw.utils;
import java.util.LinkedHashMap;
import java.util.List;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import it.polimi.tiw.beans.Album;
import it.polimi.tiw.beans.Comment;
import it.polimi.tiw.beans.Image;
import it.polimi.tiw.beans.Person;

public class JsonUtility {
	public static JsonArray getAlbumsJsonObject(LinkedHashMap<Album, Pair<Person, Image>> map) {
		JsonArray result = new JsonArray();
		JsonObject album;
		for (Album a : map.keySet()) {
			album = new JsonObject();
			album.addProperty("id", a.getId());
			album.addProperty("title", a.getTitle());
			album.addProperty("creation_date", a.getCreationDate().toString());
			album.add("creator", JsonUtility.mapToJson(map.get(a).first()));
			album.add("thumbnail", JsonUtility.mapToJson(map.get(a).second()));
			
			result.add(album);
		}
		return result;
	}
	
	public static JsonObject mapToAlbumPage(Album album,Person creator, LinkedHashMap<Image, Pair<Person, List<Pair<Person, Comment>>>> imagesAndComments) {
		JsonObject result = new JsonObject();
		result.addProperty("id", album.getId());
		result.addProperty("title", album.getTitle());
		result.addProperty("creation_date", album.getCreationDate().toString());
		result.add("creator", JsonUtility.mapToJson(creator));
		
		JsonArray images = new JsonArray();
		for (Image i : imagesAndComments.keySet()) {
			JsonObject image = mapToJson(i);
			Person uploader = imagesAndComments.get(i).first();
			List<Pair<Person, Comment>> comments = imagesAndComments.get(i).second();
			
			image.add("uploader", mapToJson(uploader));
			JsonArray commentsList = new JsonArray();
			for (Pair<Person, Comment> c : comments) {
				JsonObject comm = mapToJson(c.second());
				comm.add("author", mapToJson(c.first()));
				commentsList.add(comm);
			}
			image.add("comments", commentsList);
			images.add(image);
		}
		result.add("images", images);
		return result;
	}
	
	public static JsonObject mapToJson(Person p) {
		JsonObject result = new JsonObject();
		result.addProperty("username", p.getUsername());
		result.addProperty("id", p.getId());
		return result;
	}
	
	public static JsonObject mapToJson(Image i) {
		JsonObject result = new JsonObject();
		result.addProperty("id", i.getId());
		result.addProperty("file_path", i.getFilePath());
		result.addProperty("title", i.getTitle());
		result.addProperty("description", i.getDescription());
		result.addProperty("date", i.getUploadDate().toString());
		return result;
	}
	
	public static JsonObject mapToJson(Comment c) {
		JsonObject result = new JsonObject();
		result.addProperty("id", c.getId());
		result.addProperty("content", c.getContent());
		return result;
	}
}